// js/youtube.js
document.addEventListener('DOMContentLoaded', () => {
    loadVideoGallery();
});

function loadVideoGallery() {
    const gallery = document.getElementById('video-gallery-grid');
    if (!gallery) return;
    
    // Get videos from vehicles data
    setTimeout(() => {
        const vehicles = window.allVehicles || [];
        const videos = vehicles
            .filter(v => v.youtube && v.youtube.trim() !== '')
            .map(v => ({
                title: v.name,
                thumbnail: v.image,
                videoUrl: v.youtube
            }));
        
        if (videos.length === 0) {
            // Use demo videos if no YouTube links
            const demos = [
                {
                    title: "Honda Civic 2022 Review",
                    thumbnail: "https://placehold.co/600x400/FF0000/FFFFFF?text=Honda+Civic+Review",
                    videoUrl: "https://youtu.be/JfYui0H1gRk"
                },
                {
                    title: "Yamaha R15 V4 Test Ride",
                    thumbnail: "https://placehold.co/600x400/FF0000/FFFFFF?text=Yamaha+R15+Review",
                    videoUrl: "https://youtu.be/JfYui0H1gRk"
                },
                {
                    title: "Toyota Fortuner 2023",
                    thumbnail: "https://placehold.co/600x400/FF0000/FFFFFF?text=Toyota+Fortuner",
                    videoUrl: "https://youtu.be/JfYui0H1gRk"
                }
            ];
            renderVideos(gallery, demos);
        } else {
            renderVideos(gallery, videos);
        }
    }, 500);
}

function renderVideos(gallery, videos) {
    gallery.innerHTML = videos.map(video => `
        <div class="youtube-card" onclick="window.open('${video.videoUrl}', '_blank')">
            <div class="youtube-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                <div class="play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="vehicle-info">
                <h3>${video.title}</h3>
                <p style="color: #FF0000; margin-top: 0.5rem;">
                    <i class="fab fa-youtube"></i> Watch on YouTube
                </p>
            </div>
        </div>
    `).join('');
}
