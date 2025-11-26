document.addEventListener('keydown', function(event) {
            const isCtrlPressed = event.ctrlKey || event.metaKey; 
            const isAPressed = event.key === 'a' || event.key === 'A';

            if (isCtrlPressed && isAPressed) {
                event.preventDefault(); 
                window.location.href = '../admin/view_admin-dashboard.html';
            }
        });