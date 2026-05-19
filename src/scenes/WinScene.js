import Phaser from 'phaser';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  init(data) {
    this.coins = data.coins ?? 0;
    this.time_s = data.time ?? '0.0';
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    const title = this.add.text(width / 2, height * 0.22, 'YOU WIN!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: Math.min(width * 0.13, 84) + 'px',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.08 },
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height * 0.4, '🤖🏰', {
      fontSize: Math.min(width * 0.18, 96) + 'px'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.55, `Time: ${this.time_s}s`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.min(width * 0.06, 30) + 'px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.62, `Coins: ${this.coins}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.min(width * 0.06, 30) + 'px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const btnW = Math.min(width * 0.5, 280);
    const btnH = Math.min(height * 0.1, 64);
    const btnY = height * 0.8;

    const btn = this.add.rectangle(width / 2, btnY, btnW, btnH, 0x4caf50, 0.95)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, btnY, 'PLAY AGAIN', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: btnH * 0.42 + 'px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.tweens.add({
        targets: btn, scale: 0.94, duration: 80, yoyo: true,
        onComplete: () => this.scene.start('Game')
      });
    });
  }
}
