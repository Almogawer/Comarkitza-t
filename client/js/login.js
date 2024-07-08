localStorage.clear();
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
 
carregarLlistaComarques();

$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        event.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        // Realitza una crida AJAX al servidor per autenticar l'usuari
        $.ajax({
            url: 'http://localhost:3001/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nom: username, contrasenya: password }),
            success: function (response) {
                console.log('Resposta del servidor:', response.message);

                //verifica que l'usuari existeix
                if(message= 'ok'){
                    // Verifica si l'usuari és un administrador
                    const isAdmin = response.usuari.admin; // Assumeixo que aquesta informació està en la resposta del servidor
                    console.log(response.usuari.userId)
                    localStorage.setItem('userId', response.usuari.userId);
                    localStorage.setItem('nomUsuari', response.usuari.nom);

                    if (isAdmin) {
                        // Redirigeix a la pàgina del gestor d'amistats amb el desplegable.
                        window.location.href = 'gestorAmistats.html';
                    } else {
                        
                        window.location.href = `mapa.html`;
                    }
                } else {
                    window.alert("L'usuari no està registrat")
                }
                
            },
            error: function (error) {
                console.error('Error al iniciar sessió:', error);
            }
        });
    });

    $('#registerForm').submit(function (event) {
        event.preventDefault();
        const username = $('#usernames').val();
        const password = $('#passwords').val();
        const comarca = parseInt($('#comarcas').val());

        console.log(password, username)
        // Realitza una crida AJAX al servidor per registrar l'usuari
        $.ajax({
            url: 'http://localhost:3001/usuaris',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                nom: username,
                contrasenya: password,
                comarcaId: comarca,
                admin: 0
            }),
            success: function (response) {
                console.log('Resposta del servidor:', response.message);

                // Redirigeix a la pàgina de login després del registre
                window.location.href = 'login.html';
            },
            error: function (error) {
                console.error('Error al registrar-se:', error);
            }
        });
    }
    );
      
  }
        
);
