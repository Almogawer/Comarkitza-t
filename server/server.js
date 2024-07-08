const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');


const app = express();

app.use(bodyParser.json());
app.use(cors());

const DB_FILENAME = "data.json";
let usuaris = [];
let amistats = [];
let comarques = [];
let solicituds = [];

const load = () => {
  fs.readFile(DB_FILENAME, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        save();
        return;
      }
      throw err;
    }

    let json = JSON.parse(data);
    if (json) {
      usuaris = json.usuaris || [];
      amistats = json.amistats || [];
      comarques = json.comarques || [];
      solicituds = json.solicituds || [];
    }
  });
};


const save = () => {
  const dataToSave = {
    usuaris,
    amistats,
    comarques,
    solicituds
  };

  fs.writeFile(DB_FILENAME, JSON.stringify(dataToSave),
    err => {
      if (err) throw err;
    });
};

// Middlewares
const logController = (req, res, next) => {
  console.log('req.method = ' + req.method);
  console.log('req.URL = ' + req.originalUrl);
  console.log('req.body = ' + JSON.stringify(req.body));
  console.log("======================");
  next();
};

const headersController = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, PATCH, DELETE');
  next();
};

app.use('*', logController);
app.use('*', headersController);


//Ruta pel login
app.post('/login', loginUser);

//Ruta per obtenir les amistats per una comarca
app.get('/amistatscomarca/:userId/:comarcaId', getAmistatsByComarcaAndId)

//Ruta per obtenir els usuaris de una comarca
app.get('/usuariscomarca/:comarcaId', getUsersByComarca)

//Ruta per obtenir toes les comarques on tinc amistat
app.get('/comarquesamistats/:userId', getComarquesWhereAmistats)

//Ruta per les solicituds d'amistat
app.post('/solicitudamistat', sendSolicitudAmistat)
app.get('/solicituds/:userId1/:userId2', SolicitudByIds);
app.get('/solicituds/:userId', PendToAcceptSolicitudById); //mirar quines puc acceptar
app.get('/solicitudsPend/:userId', PendSolicitudById); //mirar quines m'han d'acceptar
app.delete('/solicitud/:usuariId1/:usuariId2', deleteSolicitudByUsers)

// Rutes pels usuaris
app.get('/usuaris', getAllUsers);
app.get('/usuaris/:userId', getUserById);
app.post('/usuaris', createUser);
app.put('/usuaris/:userId', updateUser);
app.delete('/usuaris/:userId', deleteUser);
//app.get('/id/usuaris',generateUsuariId);

// Rutes per amistats
app.get('/amistats', getAllAmistats);
app.post('/amistats', createAmistat);
app.delete('/amistats/:amistatId', deleteAmistat);
app.put('/amistats/:userId', updateAmistat);
app.get('/amistats/:userId', getAmistatsByUserId);
app.get('/id/amistats',generateAmistatId);
//
// Rutes  per comarques
app.get('/comarques', getAllComarques);
app.get('/comarques/:comarcaId', getComarcaById);
app.get('/comarques/nom/:comarcaNom', getComarcaByNom);
app.post('/comarques', createComarques);
app.put('/comarques/:comarcaId', updateComarques);
app.delete('/comarques/:comarcaId', deleteComarques);

function deleteSolicitudByUsers(req, res) {
  const usuariId1 = parseInt(req.params.usuariId1);
  const usuariId2 = parseInt(req.params.usuariId2);

  // Troba la sol·licitud d'amistat que coincideix amb els dos usuaris
  const solicitudIndex = solicituds.findIndex(
    (solicitud) =>
      (solicitud.usuariId1 === usuariId1 && solicitud.usuariId2 === usuariId2)
      
  );

  if (solicitudIndex !== -1) {
    // Elimina la sol·licitud d'amistat
    solicituds.splice(solicitudIndex, 1);
    res.json({ message: 'Sol·licitud d\'amistat eliminada amb èxit' });
    save(); // Potser cal desar els canvis si utilitzes un sistema de persistència
  } else {
    res.status(404).json({ message: 'Sol·licitud d\'amistat no trobada' });
  }
}



function PendToAcceptSolicitudById(req,res){
  const userId = parseInt(req.params.userId);
  const solicitudsUsuari = solicituds.filter(solicitud => solicitud.usuariId2 === userId);
  res.json(solicitudsUsuari);
}


function PendSolicitudById(req,res){
  const userId = parseInt(req.params.userId);
  const solicitudsUsuari = solicituds.filter(solicitud => solicitud.usuariId1 === userId);
  res.json(solicitudsUsuari);
}

function SolicitudByIds(req, res) {
  const userId1 = parseInt(req.params.userId1);
  const userId2 = parseInt(req.params.userId2);

  const solicitud = solicituds.find(
    (s) => (s.usuariId1 === userId1 && s.usuariId2 === userId2) || (s.usuariId1 === userId2 && s.usuariId2 === userId1)
  );

  if (solicitud) {
    res.json({
      existeixSolicitud: true,
      solicitud: solicitud
    });
  } else {
    res.json({
      existeixSolicitud: false,
      solicitud: null
    });
  }
}

function sendSolicitudAmistat(req, res){
  const novaSolicitud = req.body;
  novaSolicitud.solicitudId = generateSolicitudId(); 
  solicituds.push(novaSolicitud);
  res.json({ message: 'Solicitud creada amb èxit' });
  save();
}


function generateSolicitudId(req, res, next) {
  // Troba l'ID més gran entre els usuaris existents
  return solicituds.length + 1
}

function getComarquesWhereAmistats(req, res) {
  try{
    const userId = parseInt(req.params.userId);

    // Filtra les amistats per usuari
    const amistatsUsuari = amistats.filter(
      (amistat) => amistat.userId1 === userId || amistat.userId2 === userId
    );

    // Obtenir totes les comarques on té amistats
    const comarquesWhereAmistat = amistatsUsuari.map((amistat) => {
      const altreUserId = amistat.userId1 === userId ? amistat.userId2 : amistat.userId1;
      const altreUsuari = usuaris.find((usuari) => usuari.userId === altreUserId);
      return altreUsuari.comarcaId;
    });

    // Filtrar les comarques sense duplicats
    const comarquesUniques = [...new Set(comarquesWhereAmistat)];

    // Obté les dades completament de les comarques
    const comarquesAmbAmistat = comarques.filter((comarca) => comarquesUniques.includes(comarca.comarcaId));
    console.log(comarquesAmbAmistat)
    res.json(comarquesAmbAmistat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hi ha hagut un error en processar la sol·licitud.' });
  }
}
  
  


function getUsersByComarca(req, res) {
  try{
    const comarcaId = parseInt(req.params.comarcaId);

    // Filtra les amistats per usuari
    const usuarisComarca = usuaris.filter(usuari => usuari.comarcaId === comarcaId);

      // Retornar els usuaris de la comarca
    res.json(usuarisComarca);
  }catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hi ha hagut un error en processar la sol·licitud.' });
  }
  
  
}

function getAmistatsByComarcaAndId(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const comarcaId = parseInt(req.params.comarcaId);

      // Filtra les amistats per usuari
      const amistatsUsuari = amistats.filter(
        (amistat) => amistat.userId1 === userId || amistat.userId2 === userId
      );
      console.log(amistatsUsuari)
      // Filtra les amistats per comarcaId
      const amistatsUsuariComarca = amistatsUsuari.filter((amistat) => {
        const altreUserId = amistat.userId1 === userId ? amistat.userId2 : amistat.userId1;
        const altreUsuari = usuaris.find((usuari) => usuari.userId === altreUserId);

        return altreUsuari.comarcaId === comarcaId;
      });

      res.json(amistatsUsuariComarca);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hi ha hagut un error en processar la sol·licitud.' });
  }
}




// Funció per autenticar un usuari
function loginUser(req, res) {
  const { nom, contrasenya } = req.body;

  const usuariAutenticat = usuaris.find(user => user.nom === nom && user.contrasenya === contrasenya);
  console.log(usuariAutenticat)
  if (usuariAutenticat) {
    // Retorna informació de l'usuari autenticat (podeu personalitzar aquesta resposta segons les vostres necessitats)
    res.json({
      message: 'ok',
      usuari: {
        userId: usuariAutenticat.userId,
        nom: usuariAutenticat.nom,
        // Altres dades de l'usuari que vulgueu incloure
        admin: usuariAutenticat.admin
      }
    });
  } else {
    res.status(401).json({ message: 'Credencials incorrectes' });
  }
}


function getAllUsers(req, res) {
  res.json(usuaris);
  save();
}

function getUserById(req, res) {
  const userId = parseInt(req.params.userId);
  const user = usuaris.find(user => user.userId === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Usuari no trobat' });
  }
}

function createUser(req, res) {
  const newUser = req.body;
  
  const maximId = Math.max(...usuaris.map(usuari => usuari.userId), 0);
  const nouId = maximId + 1;
  newUser.userId = nouId;
  console.log(nouId)
  usuaris.push(newUser);
  res.json({ message: 'Usuari creat amb èxit' });
  save();
}

function updateUser(req, res) {
  const userId = parseInt(req.params.userId);
  const updatedUser = req.body;
  const index = usuaris.findIndex(user => user.userId === userId);
  if (index !== -1) {
    usuaris[index] = { ...usuaris[index], ...updatedUser };
    res.json({ message: 'Usuari actualitzat amb èxit' });
    save();
  } else {
    res.status(404).json({ message: 'Usuari no trobat' });
  }
}

function deleteUser(req, res) {
  const userId = parseInt(req.params.userId);
  usuaris = usuaris.filter(user => user.userId !== userId);
  res.json({ message: 'Usuari eliminat amb èxit' });
  save();
}

// COMARQUES

function deleteComarques(req, res) {
  const comarcaId = parseInt(req.params.comarcaId);
  comarques = comarques.filter(comarques => comarques.comarcaId !== comarcaId);
  res.json({ message: 'Comarca eliminada amb èxit' });
  save();
}

function getComarcaById(req, res) {
  const comarcaId = parseInt(req.params.comarcaId);
  const comarca = comarques.find(comarca => comarca.comarcaId === comarcaId);
  if (comarca) {
    res.json(comarca);
  } else {
    res.status(404).json({ message: 'Comarca no trobada' });
  }
}

function getComarcaByNom(req, res) {
  const nom = decodeURIComponent(req.params.comarcaNom);
  console.log('Nom rebut:', nom);
  const comarca = comarques.find(comarca => comarca.nom === nom);
  if (comarca) {
    res.json(comarca);
  } else {
    res.status(404).json({ message: 'Comarca no trobada' });
  }
}

function createComarques(req, res) {
  const newComarca = req.body;
  comarques.push(newComarca);
  res.json({ message: 'Comarca creada amb èxit' });
  save();
}

function updateComarques(req, res) {
  const comarcaId = parseInt(req.params.comarcaId);
  const updatedComarca = req.body;
  const index = comarques.findIndex(comarca => comarca.comarcaId === comarcaId);
  if (index !== -1) {
    comarques[index] = { ...comarques[index], ...updatedComarca };
    res.json({ message: 'Comarca actualitzada amb èxit' });
    save();
  } else {
    res.status(404).json({ message: 'Comarca no trobada' });
  }
}

function getAllComarques(req, res) {
  res.json(comarques);
}

//AMISTATS

function getAllAmistats(req, res) {
  res.json(amistats);
}

// Ruta: Crea una nova amistat
function createAmistat(req, res) {
  const novaAmistat = req.body;
  novaAmistat.amistatId = generateAmistatId(); // Assumeixo que tens una funció per generar IDs únics
  amistats.push(novaAmistat);
  res.json({ message: 'Amistat creada amb èxit' });
  save();
}

// Ruta: Esborra una amistat per ID
function deleteAmistat(req, res) {
  const amistatId = parseInt(req.params.amistatId);
  amistats = amistats.filter(amistat => amistat.amistatId !== amistatId);
  res.json({ message: 'Amistat eliminada amb èxit' });
  save();
}

// Ruta: Actualitza una amistat per ID
function updateAmistat(req, res) {
  const userId = parseInt(req.params.userId);
  const updatedAmistat = req.body;
  // Troba l'índex de l'amistat a actualitzar
  const index = amistats.findIndex(amistat => amistat.userId1 === userId || amistat.userId2 === userId);
  if (index !== -1) {
    amistats[index] = updatedAmistat;
    res.json({ message: 'Amistat actualitzada amb èxit' });
    save();
  } else {
    res.status(404).json({ message: 'Amistat no trobada' });
  }
}

// Ruta: Obté totes les amistats d'un usuari per ID
function getAmistatsByUserId(req, res) {
  const userId = parseInt(req.params.userId);
  const amistatsUsuari = amistats.filter(amistat => amistat.userId1 === userId || amistat.userId2 === userId);
  res.json(amistatsUsuari);
}

// Funció per generar IDs únics per a les amistats
function generateAmistatId() {
  return amistats.length + 1; // Pots fer això més sofisticat segons les teves necessitats
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

load();
