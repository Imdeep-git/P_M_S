document.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const targetId = e.target.dataset.copyTarget;
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text);
        e.target.textContent = 'Copied!';
        setTimeout(() => { e.target.textContent = 'Copy'; }, 1000);
    }
});

document.getElementById('screenshotBtn').addEventListener('click', () => {
    const ticket = document.getElementById('ticketContainer');
    const button = document.getElementById('screenshotBtn');

    // Hide the button before screenshot
    button.style.display = 'none';

    // Clone ticket off-screen for high-res
    const clone = ticket.cloneNode(true);
    clone.style.width = '1800px';
    clone.style.transform = 'scale(1)';
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    const cloneQR = clone.querySelector('#qrCodeImage');
    if (cloneQR) {
        const originalQR = document.getElementById('qrCodeImage');
        cloneQR.src = originalQR.src;
        cloneQR.width = originalQR.naturalWidth;
        cloneQR.height = originalQR.naturalHeight;
    }

    html2canvas(clone, {
        scale: 10,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0
    }).then(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const link = document.createElement('a');
        link.download = 'parking_ticket.jpg';
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();

        // Restore the button after screenshot
        button.style.display = 'inline-block';
        document.body.removeChild(clone);
    });
});