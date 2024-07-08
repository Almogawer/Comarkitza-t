function enviarSolicitud(usuariLoggejatID ,userId) {
  // Realitza una crida AJAX per enviar la sol·licitud d'amistat
  $.ajax({
    url: `http://localhost:3001/solicitudamistat`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      usuariId1: usuariLoggejatID,
      usuariId2: userId
    }),
    success: function (response) {
      console.log('Sol·licitud enviada amb èxit:', response.message);
      location.reload();
    },
    error: function (error) {
      console.error('Error al enviar la sol·licitud:', error);
    }
  });
}

function solicitudenviada(usuariLoggejatID, userId) {
  let existeixSolicitud = false;

  $.ajax({
    url: `http://localhost:3001/solicituds/${usuariLoggejatID}/${userId}`,
    method: 'GET',
    contentType: 'application/json',
    async: false,  // Assegura que la funció espera la resposta de l'ajax abans de continuar
    success: function (response) {
      console.log(response.message);

      existeixSolicitud = response.existeixSolicitud;
    },
    error: function (error) {
      console.error('Error al comprovar la sol·licitud:', error);
    }
  });

  return existeixSolicitud;
}

document.addEventListener('DOMContentLoaded', () => {
  // Obtenir el paràmetre del nom de la comarca de la URL
  const params = new URLSearchParams(window.location.search);
  const comarca = params.get('comarca');
  const userId = localStorage.getItem('userId');
  console.log
  let comarcaId;

  // Actualitzar la barra lateral amb la informació de l'usuari loggejat
  

  // Establir el títol i el subtítol amb el nom de la comarca
  $('#comarcaTitle').text(comarca);
  $('#comarcaHeading').text(`${comarca} - Amistats i Usuaris`);

  // Fes la crida AJAX per obtenir l'ID de la comarca
  $.ajax({
    url: `http://localhost:3001/comarques/nom/${comarca}`,
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      comarcaId = response.comarcaId;

      // Fes la crida AJAX per obtenir les amistats de la comarca
      $.ajax({
        url: `http://localhost:3001/amistatscomarca/${userId}/${comarcaId}`,
        method: 'GET',
        dataType: 'json',
        success: function (amistats) {
          // Mostra les amistats de l'usuari per aquesta comarca
          const llistaAmistats = $('#llistaAmistats');
          
          amistats.forEach(amistat => {
                const altrenom = amistat.userId1
                if(amistat.userId1 == userId){
                  altraamistat=amistat.userId2
                }
                $.ajax({
                  url: `http://localhost:3001/usuaris/${altrenom}`,
                  method: 'GET',
                  dataType: 'json',
                  success: function (user){
                  
                  
                  
                  }
                });
            
          });
          $.ajax({
            url: `http://localhost:3001/usuariscomarca/${comarcaId}`,
            method: 'GET',
            dataType: 'json',
            success: function (usuarisComarca) {
              // Mostra els usuaris de la comarca
              
              
              usuarisComarca.forEach(usuari => {
                if(usuari.userId != userId){
                const amistat = amistats.find(
                  (user) => user.userId1 === usuari.userId || user.userId2 === usuari.userId
                );
                if(!amistat){
                    const llistaUsuarisComarca = $('#llistaUsuarisComarca');
                    if(!solicitudenviada(userId, usuari.userId)){
                      const item = `
                      <li class="list-group-item">${usuari.nom}</li>
                      <button class="btn btn-primary" onclick="enviarSolicitud(${userId},${usuari.userId})">Enviar sol·licitud</button>
                      `
                      llistaUsuarisComarca.append(item);
                      
                    }
                    else{
                      const item = `
                      <li class="list-group-item">${usuari.nom}</li>
                      <span class="badge bg-secondary">Solicitud pendent</span>
                      `
                      llistaUsuarisComarca.append(item);
                    }
                  }
                  else{
                    const llistaAmistats = $('#llistaAmistats');
                    const item = `
                    <li class="list-group-item">
                        ${usuari.nom} Amistat de Nivell: ${amistat.nivell} 
                        
                    </li>`;
                    llistaAmistats.append(item);
                  }
                  
                }
              });
            
            },
            error: function (error) {
              console.error('Error al obtenir els usuaris de la comarca:', error);
            }
          })
        },
        error: function (error) {
          console.error('Error al obtenir les amistats:', error);
        }
      });
      
    },
    error: function (error) {
      console.error('Error al obtenir el id de la comarca:', error);
    },
    
  });

  
});
