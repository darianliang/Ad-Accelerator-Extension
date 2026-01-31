(function() {
    'use strict';

    // configuration
    const AD_SPEED = 16; // speed multiplier during ads
    const NORMAL_SPEED = 1; // normal playback speed
    const CHECK_INTERVAL = 500; // interval to check for ads (ms)

    let video = null;
    let observer = null;
    let checkInterval = null;

    // initialize when page loads
    function init() {
        console.log('Ad Accelerator initializing...');
        waitForVideo(); // wait for video element to load
        setupObserver(); // set up mutation observer to detect DOM changes
        startAdCheck(); // start checking for ads

    }

    // wait for video element to be available
    function waitForVideo() {
        const findVideo = setInterval(() => {
            video = document.querySelector('video');
            if (video) {
                clearInterval(findVideo);
                console.log('Video element found.');

                // add event listener to reset speed on video end
                video.addEventListener('loadedmetadata', checkForAd);
                video.addEventListener('timeupdate', checkForAd);

            }
        }, 100);
    }

    // set up mutation observer to monitor DOM changes
    function setupObserver() {
        observer = new MutationObserver((mutations) => {
            // check if video element changed
            const currentVideo = document.querySelector('video');
            if (currentVideo && currentVideo !== video) {
                video = currentVideo;
                video.addEventListener('loadedmetadata', checkForAd);
                video.addEventListener('timeupdate', checkForAd);
                console.log('Video element updated.');
            } 
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // start periodic ad checking
    function startAdCheck() {
        checkInterval = setInterval(checkForAd, CHECK_INTERVAL);
    }

    // main function to see if an ad is playing
    function checkForAd() {
        if (!video) return;

        const isAd = detectAd();

        if (isAd && video.playbackRate !== AD_SPEED) {
            console.log('Ad detected. Speeding up video.');
            video.playbackRate = AD_SPEED;
            video.muted = true; // mute during ads
        }
        else if (!isAd && video.playbackRate === AD_SPEED) {
            console.log('Ad ended. Resetting video speed.');
            video.playbackRate = NORMAL_SPEED;
            video.muted = false; // unmute when ad ends
        }
    }

    // see if an ad is currently playing using multiple methods
    function detectAd() {
        // method 1: check for ad-specific UI elements
        const adModule = document.querySelector('.video-ads.ytp-ad-module');
        const adPlaying = document.querySelector('.ad-showing');
        const adContainer = document.querySelector('.ytp-ad-player-overlay');
        const skipButton = document.querySelector('.ytp-ad-skip-button');
        const adBadge = document.querySelector('.ytp-ad-preview-text');

        // method 2: check player container for ad class
        const playerContainer = document.querySelector('.html5-video-player');
        const hasAdClass = playerContainer && playerContainer.classList.contains('ad-showing');

        // method 3: check for ad text in player
        const adText = document.querySelector('.ytp-ad-text');

        // method 4: check video info area
        const videoInfo = document.querySelector('.ytp-ad-preview-container');

        // return true if any ad indicators are found
        return adModule || adPlaying || adContainer || skipButton || adBadge || hasAdClass || adText || videoInfo;
    }

    //clean up function
    function cleanup() {
        if (observer) observer.disconnect();
        if (checkInterval) clearInterval(checkInterval);
    }

    // initialize extension
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    else {
        init();
    }
    // clean up on unload
    window.addEventListener('beforeunload', cleanup);
})();