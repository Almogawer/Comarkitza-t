document.addEventListener('DOMContentLoaded', () => {
    // ... (altres funcions)
  
    function carregarLlistaAmistats() {
        $.ajax({
          url: 'http://localhost:3001/amistats',
          method: 'GET',
          dataType: 'json',
          success: function (data) {
            // Manipula el DOM per omplir la taula amb la llista d'amistats
            const llistaAmistats = $('#llistaAmistats');
            llistaAmistats.empty(); // Esborra les dades anteriors
      
            data.forEach(amistat => {
              const fila = `<tr>
                <td>${amistat.amistatId}</td>
                <td>${amistat.userId1}</td>
                <td>${amistat.userId2}</td>
                <td>${amistat.nivell}</td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="eliminarAmistat(${amistat.id})">Eliminar</button>
                </td>
              </tr>`;
              llistaAmistats.append(fila);
            });
          },
          error: function (error) {
            console.error('Error al obtenir la llista d\'amistats:', error);
          }
        });
      }
      
    // Funció per afegir una amistat
    function afegirAmistat(user1, user2, nivell) {
      const method = 'POST';
      const url = 'http://localhost:3001/amistats';
  
      const data = {
        userId1: user1,
        userId2: user2,
        nivell
      };
  
      $.ajax({
        url,
        method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (data) {
          console.log(`Amistat creada amb èxit:`, data);
          carregarLlistaAmistats();
        },
        error: function (error) {
          console.error('Error al afegir l\'amistat:', error);
        }
      });
    }
  
    // Funció per carregar la llista d'usuaris amb placeholders
    function carregarLlistaUsuarisAmbPlaceholders() {
      $.ajax({
        url: 'http://localhost:3001/usuaris',
        method: 'GET',
        dataType: 'json',
        success: function (usuaris) {
          const llistaUsuaris = $('#llistaUsuaris');
          const selectUser1 = $('#user1');
          const selectUser2 = $('#user2');
  
          llistaUsuaris.empty(); // Esborra les dades anteriors
          selectUser1.empty(); // Esborra les dades anteriors
          selectUser2.empty(); // Esborra les dades anteriors
  
          usuaris.forEach(usuari => {
            const opcio = `<option value="${usuari.userId}">${usuari.nom}</option>`;
            llistaUsuaris.append(opcio);
            selectUser1.append(opcio);
            selectUser2.append(opcio);
          });
        },
        error: function (error) {
          console.error('Error al obtenir la llista d\'usuaris:', error);
        }
      });
    }
  
    // Carregar la llista d'usuaris amb placeholders inicialment
    carregarLlistaUsuarisAmbPlaceholders();
  
    // Gestiona l'esdeveniment de submit del formulari d'amistats
    $('#formAfegirAmistat').submit(function (event) {
      event.preventDefault();
      const user1 = parseInt($('#user1').val());
      const user2 = parseInt($('#user2').val());
      const nivell = parseInt($('#nivell').val());
      
      if (user1 === user2) {
        alert("No es pot establir una amistat amb tu mateix!");
        return;
      }

      afegirAmistat(user1, user2, nivell);
  
      // Refresca la llista d'usuaris amb placeholders després d'afegir l'amistat
      carregarLlistaUsuarisAmbPlaceholders();

      
  
      // Reseteja el formulari
      $('#formAfegirAmistat')[0].reset();
    });
    carregarLlistaAmistats();
  });