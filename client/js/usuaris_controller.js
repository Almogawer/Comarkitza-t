// usuaris_controller.js
document.addEventListener('DOMContentLoaded', () => {
  // Crida a l'API per obtenir la llista d'usuaris i omplir la taula
  function carregarLlistaUsuaris() {
    $.ajax({
      url: 'http://localhost:3001/usuaris',
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        // Manipula el DOM per omplir la taula amb la llista d'usuaris
        const llistaUsuaris = $('#llistaUsuaris');
        llistaUsuaris.empty(); // Esborra les dades anteriors

        data.forEach(usuari => {
          const fila = `<tr>
            <td>${usuari.userId}</td>
            <td>${usuari.nom}</td>
            <td>${usuari.comarcaId}</td>
            <td>${usuari.admin}</td>
            <td>${usuari.contrasenya}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editarUsuari(${usuari.userId})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="eliminarUsuari(${usuari.userId})">Eliminar</button>
            </td>
          </tr>`;
          llistaUsuaris.append(fila);
        });
      },
      error: function (error) {
        console.error('Error al obtenir la llista d\'usuaris:', error);
      }
    });
  }

  // Funció per carregar la llista de comarques al formulari
  function carregarLlistaComarques() {
    $.ajax({
      url: 'http://localhost:3001/comarques',
      method: 'GET',
      dataType: 'json',
      success: function (comarques) {
        const comarcaSelect = document.getElementById('comarcas');
        comarcaSelect.innerHTML = ''; // Esborra les dades anteriors

        comarques.forEach(comarca => {
          const option = document.createElement('option');
          option.value = comarca.comarcaId;
          option.textContent = comarca.nom;
          comarcaSelect.appendChild(option);
        });
      },
      error: function (error) {
        console.error('Error al obtenir la llista de comarques:', error);
      }
    });
  }

  //function obtenirNouIdUsuari() {
  //  return new Promise((resolve, reject) => {
  //    $.ajax({
  //      url: 'http://localhost:3001/id/usuaris',
  //      method: 'GET',
  //      dataType: 'json',
  //      success: function (long) {
  //        console.log('Nou ID d\'usuari:', long.long);
  //        // Resol la Promise amb el nou ID
  //        resolve(long.long);
  //      },
  //      error: function (error) {
  //        console.error('Error al obtenir el nou ID d\'usuari:', error);
  //        // Rebutja la Promise amb l'error
  //        reject(error);
  //      }
  //    });
  //  });
  //}

  // Funció per afegir o actualitzar un usuari
  function afegirUsuari(nom, comarcaId, contrasenya, admin) {
    const method = 'POST';
    const url = 'http://localhost:3001/usuaris';
        const data = {
          nom,
          comarcaId: parseInt(comarcaId),
          contrasenya,
          admin
        };
  
        $.ajax({
          url,
          method,
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function (data) {
            carregarLlistaUsuaris();
          },
          error: function (error) {
            console.error(`Error al 'afegir'} l\'usuari:`, error);
          }
        });

  }
  

  // Funció per eliminar un usuari
  window.eliminarUsuari = function (userId) {
    // Mostra un missatge de confirmació
    const confirmacio = confirm("Estàs segur que vols eliminar aquest usuari?");
    
    // Verifica si l'usuari ha confirmat abans de procedir amb la eliminació
    if (confirmacio) {
      $.ajax({
        url: `http://localhost:3001/usuaris/${userId}`,
        method: 'DELETE',
        success: function (data) {
          console.log('Usuari eliminat amb èxit:', data);
          carregarLlistaUsuaris();
        },
        error: function (error) {
          console.error('Error al eliminar l\'usuari:', error);
        }
      });
    } else {
      console.log('Eliminació cancel·lada.');
    }
  };
  

  // Funció per editar un usuari
  window.editarUsuari = function (userId) {
    $.ajax({
      url: `http://localhost:3001/usuaris/${userId}`,
      method: 'GET',
      dataType: 'json',
      success: function (usuari) {
        $('#nom').val(usuari.nom);
        $('#comarcas').val(usuari.comarcaId);
        $('#userId').val(usuari.userId);
      },
      error: function (error) {
        console.error('Error al obtenir l\'usuari per editar:', error);
      }
    });
  };

  // Carregar la llista d'usuaris i comarques inicialment
  carregarLlistaUsuaris();
  carregarLlistaComarques();

  // Gestiona l'esdeveniment de submit del formulari
  $('#formAfegirUsuari').submit(function (event) {
    event.preventDefault();
    const nom = $('#nom').val();
    const contrasenya = $('#contrasenya').val();
    const admin = parseInt($('#admin').val());
    const comarcaId = $('#comarcas').val();
    
    afegirUsuari(nom, comarcaId, contrasenya, admin);

    // Reseteja el formulari
    $('#formAfegirUsuari')[0].reset();
  });


});
