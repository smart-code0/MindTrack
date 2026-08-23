// Script para manejar la selección múltiple de emociones en reporte.html

document.addEventListener('DOMContentLoaded', function() {
    const emotionButtons = document.querySelectorAll('.emotion');

    emotionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Alternar la clase selected
            this.classList.toggle('selected');
        });
    });
});
