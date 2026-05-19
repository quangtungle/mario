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

const game = new Phaser.Game(config);
if (import.meta.env.DEV) {
  window.__game = game;
}
