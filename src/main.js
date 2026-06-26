import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import WinScene from './scenes/WinScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#5c94fc',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1500 },
      debug: false
    }
  },
  input: {
    activePointers: 3
  },
  scene: [GameScene, WinScene]
};

const applyViewport = () => {
  const vv = window.visualViewport;
  const w = vv ? vv.width : window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-w', w + 'px');
  document.documentElement.style.setProperty('--app-h', h + 'px');
};
applyViewport();

const game = new Phaser.Game(config);

const refreshScale = () => {
  applyViewport();
  if (game.scale) game.scale.refresh();
};
window.addEventListener('resize', refreshScale);
window.addEventListener('orientationchange', () => {
  setTimeout(refreshScale, 100);
  setTimeout(refreshScale, 400);
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', refreshScale);
  window.visualViewport.addEventListener('scroll', refreshScale);
}

if (import.meta.env.DEV) {
  window.__game = game;
}
