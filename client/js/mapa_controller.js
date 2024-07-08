function acceptarSolicitud(usuariLoggejatID, usuariSolicitadorID, comarcaId) {
  // Esborra la sol·licitud
  $.ajax({
    url: `http://localhost:3001/solicitud/${usuariLoggejatID}/${usuariSolicitadorID}`,
    method: 'DELETE',
    success: function () {
      console.log('Sol·licitud eliminada amb èxit.');

      // Crea una amistat
      $.ajax({
        url: 'http://localhost:3001/amistats',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          userId2: usuariLoggejatID,
          userId1: usuariSolicitadorID,
          nivell: 1, // Nivell desitjat per a la nova amistat
        }),
        success: function () {
          console.log('Amistat creada amb èxit.');
          // Potser pots actualitzar la interfície d'usuari aquí, si és necessari
          location.reload();
        },
        error: function (error) {
          console.error('Error al crear l\'amistat:', error);
        }
      });
    },
    error: function (error) {
      console.error('Error al eliminar la sol·licitud:', error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2
  });

  const usuariLoggejat = localStorage.getItem('nomUsuari');
  console.log(usuariLoggejat)
  const usuariLoggejatID = localStorage.getItem('userId');
  console.log(usuariLoggejatID)
  // Actualitzar la barra lateral amb la informació de l'usuari loggejat
  if (usuariLoggejat) {
    document.getElementById('nomUsuari').textContent = `Nom d'usuari: ${usuariLoggejat}`;
  }

  // Defineix la mida del mapa d'imatges (ample i alt)
  const imgWidth = 20;
  const imgHeight = 17;

  // Afegeix una imatge de fons com a "mapa"
  const imageUrl = 'https://aplicacions.municat.gencat.cat/upload/escola/comarques_referencia.png';
  const bounds = [[0, 0], [imgHeight, imgWidth]];
  L.imageOverlay(imageUrl, bounds).addTo(map);

  // Defineix les coordenades (x, y) dels cercles en el teu mapa
  const circleCoordinates = [
    { x: 3, y: 2.5, comarca: 'Baix Ebre' }, 
    { x: 2.57, y: 1.25, comarca: 'Montsià' },
    { x: 3.828, y: 3.852, comarca: `Ribera d'Ebre`}, //cuidado
    { x: 4.6, y: 5.2, comarca: 'Priorat'},
    { x: 2, y: 4.19, comarca: 'Terra Alta'},
    { x: 5.9, y: 4.7, comarca: 'Baix Camp'},
    { x: 7.5, y: 4.4, comarca: 'Tarragonés'},
    { x: 9, y: 5, comarca: 'Baix Penedès'},
    { x: 7.5, y: 5.5, comarca: 'Alt Camp'},
    { x: 5, y: 6.5, comarca: 'Garrigues'},
    { x: 3, y: 8, comarca: 'Segrià'},
    { x: 5, y: 10, comarca: 'Noguera'},
    { x: 5.5, y: 12, comarca: 'Pallars Jussà'},
    { x: 4.8, y: 14, comarca: 'Alta Ribagorça'},
    { x: 5, y: 15.5, comarca: `Val d'Aran`}, //cuidado
    { x: 10.2, y: 5.2, comarca: `Garraf`}, 
    { x: 11.6, y: 6, comarca: `Baix Llobregat`}, 
    { x: 13, y: 6, comarca: `Barcelonès`},
    { x: 15, y: 7.2, comarca: `Maresme`},
    { x: 15.5, y: 9.5, comarca: `Selva`},
    { x: 16.5, y: 10.2, comarca: `Gironès`},
    { x: 18, y: 10, comarca: `Baix Empordà`},
    { x: 17.5, y: 12.5, comarca: `Alt Empordà`},
    { x: 16.5, y: 11.5, comarca: `Pla de l'Estany`},
    { x: 5, y: 8, comarca: `Pla d'Urgell`},
    { x: 6.4, y: 7.8, comarca: `Urgell`},
    { x: 7.8, y: 8.5, comarca: `Segarra`},
    { x: 7, y: 6.5, comarca: `Conca de Barberà`},
    { x: 9.2, y: 7.6, comarca: `Anoia`},
    { x: 12, y: 7.2, comarca: `Vallès Occidental`},
    { x: 13.8, y: 8, comarca: `Vallès Oriental`},
    { x: 10.7, y: 8.8, comarca: `Bages`},
    { x: 10, y: 6, comarca: `Alt Penedès`},
    { x: 12.3, y: 8.9, comarca: `Moianès`},
    { x: 11, y: 11, comarca: `Berguedà`},
    { x: 9, y: 10.6, comarca: `Solsonès`},
    { x: 8.2, y: 12.4, comarca: `Alt Urgell`},
    { x: 7, y: 14.4, comarca: `Pallars Sobirà`},
    { x: 10.4, y: 13.3, comarca: `Cerdanya`},
    { x: 13, y: 12.3, comarca: `Ripollès`},
    { x: 13.5, y: 9.9, comarca: `Osona`},
    { x: 15, y: 11.8, comarca: `Garrotxa`},


    
  ];

  // Afegeix cercles al mapa amb les coordenades especificades
  
  $.ajax({
    url: `http://localhost:3001/solicituds/${usuariLoggejatID}`,
    method: 'GET',
    dataType: 'json',
    success: function (solicitudsPendents) {
      // Actualitza la barra lateral amb les sol·licituds pendents
      const llistaSolicitudsPendents = $('#llistaSolicitudsPendents');
      llistaSolicitudsPendents.empty(); // Neteja la llista abans d'afegir nous elements

      solicitudsPendents.forEach(solicitud => {
        $.ajax({
          url: `http://localhost:3001/usuaris/${solicitud.usuariId1}`,
          method: 'GET',
          dataType: 'json',
          success: function (usuari) {

            $.ajax({
              url: `http://localhost:3001/comarques/${usuari.comarcaId}`,
              method: 'GET',
              dataType: 'json',
              success: function (comarca) {
                const nomComarca = comarca.nom;
                // Resta del teu codi per actualitzar la barra lateral amb el nom de la comarca
                const nomUsuari = usuari.nom;
                // Resta del teu codi per actualitzar la barra lateral amb el nom de l'usuari
                const item = `
                <li class="list-group-item">
                  Sol·licitud de ${nomUsuari} de la comarca ${nomComarca}
                  <button class="btn btn-success" onclick="acceptarSolicitud(${usuari.userId}, ${usuariLoggejatID})">Acceptar</button>
                </li>
              `;
              llistaSolicitudsPendents.append(item);
              },
              error: function (error) {
                console.error('Error al obtenir el nom de la comarca:', error);
              }
            });
            
          },
          error: function (error) {
            console.error('Error al obtenir el nom de l\'usuari:', error);
          }
        });
        
      });
    },
    error: function (error) {
      console.error('Error al obtenir les sol·licituds pendents:', error);
    }
  });

    $.ajax({
      url: `http://localhost:3001/usuaris/${usuariLoggejatID}`,
      method: 'GET',
      dataType: 'json',
      success: function (usuari) {
        console.log(usuari)
        $.ajax({
          url: `http://localhost:3001/comarques/${usuari.comarcaId}`,
          method: 'GET',
          dataType: 'json',
          success: function (comarca) {
            const comarcaMeva = comarca.nom
            console.log(comarca.nom) //JA TENIM EL NOM DE LA NOSTRA COMARCA

            $.ajax({
              url: `http://localhost:3001/comarquesamistats/${usuariLoggejatID}`,
              method: 'GET',
              dataType: 'json',
              success: function (comarques) {
                console.log(comarques)
                const comarquesAmistat = comarques
                

                //si no tinc amistat roig, si es la meva blau, si tinc amistat verd
                circleCoordinates.forEach(coord => {
                  let color = 'red'
                  if(coord.comarca == comarcaMeva) color = 'blue'
                  
                  else{
                    comarquesAmistat.forEach(comarca => {
                      if(comarca.nom == coord.comarca)
                        color = 'green'
                      })
                  }
                  
                  const circle = L.circle([coord.y, coord.x], {
                    radius: 0.5,
                    color: color, // Color per ressaltar el cercle
                    fillOpacity: 0.5
                  }).addTo(map);
                  circle.on('click', () => {
                  // Redirigeix a la pàgina d'amistats amb la comarca com a paràmetre
                  window.location.href = `comarca.html?comarca=${encodeURIComponent(coord.comarca)}`;
                });
                })
                

              },
              error: function (error) {
                console.error('Error al obtenir els usuaris de la comarca:', error);
              }

          })
          },
          error: function (error) {
            console.error('Error al obtenir el nom de la meva comarca:', error);
          }
        }) 
    },
      error: function (error) {
        console.error('Error al obtenir els usuaris de la comarca:', error);
      }
    })

    //buscar els comarques on tingui amistat, despintar, pintar de color verd

    // Afegeix un esdeveniment de clic al cercle
    
    // Centra el mapa en funció de la imatge
  map.fitBounds(bounds);
  
  });

  
