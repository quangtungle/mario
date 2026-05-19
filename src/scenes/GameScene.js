import Phaser from 'phaser';
import { LEVEL } from '../level.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.physics.world.setBounds(0, 0, LEVEL.width, LEVEL.height);
    this.cameras.main.setBounds(0, 0, LEVEL.width, LEVEL.height);
    this.cameras.main.setBackgroundColor('#5c94fc');

    this.drawClouds();
    this.createPlatforms();
    this.createBricks();
    this.createCoins();
    this.createEnemies();
    this.createCastle();
    this.createPlayer();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.player, this.bricks, this.hitBrick, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.touchEnemy, null, this);
    this.physics.add.overlap(this.player, this.winZone, this.win, null, this);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.1);

    this.dead = false;
    this.won = false;
    this.coinScore = 0;
    this.startTime = this.time.now;

    this.createHUD();
    this.createControls();
    this.showIntro();
  }

  drawClouds() {
    const positions = [
      { x: 200, y: 100 }, { x: 600, y: 70 }, { x: 1000, y: 120 },
      { x: 1500, y: 80 }, { x: 1900, y: 100 }, { x: 2400, y: 70 },
      { x: 2900, y: 110 }, { x: 3400, y: 80 }, { x: 3900, y: 100 }
    ];
    positions.forEach(p => {
      this.add.text(p.x, p.y, '☁️', {
        fontSize: '52px'
      }).setOrigin(0.5).setScrollFactor(0.4).setDepth(0);
    });
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    LEVEL.platforms.forEach(p => {
      const isGround = p.y >= 590;
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;

      if (isGround) {
        this.add.rectangle(cx, cy, p.w, p.h, 0x8b4513).setDepth(1);
        this.add.rectangle(cx, p.y + 6, p.w, 12, 0x4caf50).setDepth(1);
        for (let gx = p.x + 12; gx < p.x + p.w - 12; gx += 20) {
          this.add.text(gx, p.y - 4, '·', {
            fontSize: '14px',
            color: '#2e7d32'
          }).setOrigin(0.5).setDepth(1);
        }
      } else {
        this.add.rectangle(cx, cy, p.w, p.h, 0xc97a3b).setStrokeStyle(2, 0x6b4326).setDepth(1);
        for (let bx = p.x + 10; bx < p.x + p.w - 5; bx += 20) {
          this.add.line(0, 0, bx, p.y, bx, p.y + p.h, 0x6b4326).setOrigin(0).setDepth(1);
        }
      }

      const block = this.add.rectangle(cx, cy, p.w, p.h, 0x000000, 0);
      this.physics.add.existing(block, true);
      this.platforms.add(block);
    });
  }

  createBricks() {
    this.bricks = this.physics.add.staticGroup();
    LEVEL.bricks.forEach(b => {
      const size = 40;
      const isQ = b.type === 'question';
      const fill = isQ ? 0xffd54f : 0xc97a3b;
      const stroke = isQ ? 0xa67800 : 0x6b4326;

      const block = this.add.rectangle(b.x, b.y, size, size, fill)
        .setStrokeStyle(2, stroke).setDepth(1);
      this.physics.add.existing(block, true);
      block.setData('type', b.type);
      block.setData('used', false);

      if (isQ) {
        const label = this.add.text(b.x, b.y, '?', {
          fontFamily: 'Arial Black, sans-serif',
          fontSize: '26px',
          color: '#7a4f00'
        }).setOrigin(0.5).setDepth(2);
        block.setData('label', label);
      } else {
        const g = this.add.graphics().setDepth(2);
        g.lineStyle(1, 0x6b4326, 0.75);
        g.lineBetween(b.x - size / 2 + 2, b.y, b.x + size / 2 - 2, b.y);
        g.lineBetween(b.x, b.y - size / 2 + 2, b.x, b.y + size / 2 - 2);
        block.setData('decor', g);
      }

      this.bricks.add(block);
    });
  }

  createCoins() {
    this.coins = this.physics.add.staticGroup();
    LEVEL.coins.forEach(c => {
      const coin = this.add.text(c.x, c.y, '💎', {
        fontSize: '28px'
      }).setOrigin(0.5).setDepth(2);
      this.physics.add.existing(coin, true);
      coin.body.setCircle(14, -14, -14);
      this.coins.add(coin);

      this.tweens.add({
        targets: coin,
        y: coin.y - 6,
        yoyo: true,
        repeat: -1,
        duration: 700,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    LEVEL.enemies.forEach(e => {
      const enemy = this.add.text(e.x, e.y, '🍄', {
        fontSize: '32px'
      }).setOrigin(0.5).setDepth(2);
      this.physics.add.existing(enemy);
      enemy.body.setSize(28, 28);
      enemy.body.setOffset(-14, -14);
      enemy.body.setVelocityX(-80);
      enemy.setData('dir', -1);
      this.enemies.add(enemy);
    });
  }

  createCastle() {
    this.add.text(LEVEL.castle.x, LEVEL.castle.y, '🏰', {
      fontSize: '160px'
    }).setOrigin(0.5).setDepth(1);

    const flag = this.add.text(LEVEL.flag.x, LEVEL.flag.y, '🚩', {
      fontSize: '40px'
    }).setOrigin(0.5).setDepth(2);
    this.tweens.add({
      targets: flag,
      angle: { from: -8, to: 8 },
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });

    this.winZone = this.add.zone(LEVEL.winX, 500, 60, 240);
    this.physics.add.existing(this.winZone, true);
  }

  createPlayer() {
    this.player = this.add.text(LEVEL.player.x, LEVEL.player.y, '🤖', {
      fontSize: '40px'
    }).setOrigin(0.5).setDepth(3);
    this.physics.add.existing(this.player);
    this.player.body.setSize(28, 34);
    this.player.body.setOffset(-14, -17);
    this.player.body.setMaxVelocity(220, 900);
  }

  createHUD() {
    this.scoreText = this.add.text(16, 12, '💎 0', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    this.timeText = this.add.text(this.scale.width / 2, 12, '0:00', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
  }

  showIntro() {
    const w = this.scale.width;
    const intro = this.add.text(w / 2, 80, 'GET TO THE CASTLE!', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(150);

    this.tweens.add({
      targets: intro,
      alpha: 0,
      delay: 2000,
      duration: 800,
      onComplete: () => intro.destroy()
    });
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ A: 'A', D: 'D', W: 'W', SPACE: 'SPACE' });
    this.controls = { left: false, right: false, jump: false };

    const w = this.scale.width;
    const h = this.scale.height;
    const btnSize = Math.min(w, h) * 0.13;
    const margin = btnSize * 0.6;

    const makeBtn = (cx, cy, label, color) => {
      const c = this.add.circle(cx, cy, btnSize, color, 0.22)
        .setStrokeStyle(3, 0xffffff, 0.6)
        .setScrollFactor(0).setDepth(100).setInteractive();
      this.add.text(cx, cy, label, {
        fontSize: btnSize * 0.7 + 'px',
        color: '#ffffff'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      return c;
    };

    const lx = margin + btnSize;
    const ly = h - margin - btnSize;
    const rx = lx + btnSize * 2.4;
    const jx = w - margin - btnSize;

    const lbtn = makeBtn(lx, ly, '◀', 0xffffff);
    const rbtn = makeBtn(rx, ly, '▶', 0xffffff);
    const jbtn = makeBtn(jx, ly, '▲', 0xff6b6b);

    const wireBtn = (btn, key) => {
      btn.on('pointerdown', () => { this.controls[key] = true; });
      btn.on('pointerup', () => { this.controls[key] = false; });
      btn.on('pointerout', () => { this.controls[key] = false; });
      btn.on('pointerupoutside', () => { this.controls[key] = false; });
    };
    wireBtn(lbtn, 'left');
    wireBtn(rbtn, 'right');
    wireBtn(jbtn, 'jump');
  }

  hitBrick(player, brick) {
    if (this.dead || this.won) return;
    if (!(player.body.touching.up || player.body.blocked.up)) return;
    if (brick.getData('used')) return;

    const type = brick.getData('type');
    if (type === 'brick') {
      brick.setData('used', true);
      const decor = brick.getData('decor');
      if (decor) decor.destroy();
      this.shatterBrick(brick.x, brick.y);
      brick.destroy();
      this.coinScore++;
      this.scoreText.setText('💎 ' + this.coinScore);
    } else {
      brick.setData('used', true);
      brick.setFillStyle(0x8b6914);
      const label = brick.getData('label');
      if (label) label.destroy();
      this.popCoin(brick.x, brick.y - 4);
      const startY = brick.y;
      this.tweens.add({
        targets: brick,
        y: startY - 6,
        yoyo: true,
        duration: 100,
        onUpdate: () => brick.body.updateFromGameObject()
      });
    }
  }

  shatterBrick(x, y) {
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const frag = this.add.rectangle(x, y, 16, 16, 0xc97a3b)
        .setStrokeStyle(1, 0x6b4326).setDepth(3);
      this.physics.add.existing(frag);
      frag.body.setVelocity(Math.cos(ang) * 180, Math.sin(ang) * 120 - 280);
      frag.body.setGravityY(900);
      this.tweens.add({
        targets: frag,
        alpha: 0,
        duration: 700,
        onComplete: () => frag.destroy()
      });
    }
  }

  popCoin(x, y) {
    const coin = this.add.text(x, y, '💎', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(4);
    this.tweens.add({
      targets: coin,
      y: y - 60,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: coin,
          alpha: 0,
          y: y - 80,
          duration: 200,
          onComplete: () => coin.destroy()
        });
      }
    });
    this.coinScore++;
    this.scoreText.setText('💎 ' + this.coinScore);
  }

  collectCoin(player, coin) {
    if (this.dead) return;
    coin.destroy();
    this.coinScore++;
    this.scoreText.setText('💎 ' + this.coinScore);
  }

  touchEnemy(player, enemy) {
    if (this.dead || this.won) return;
    if (player.body.velocity.y > 50 && player.y < enemy.y - 6) {
      enemy.destroy();
      player.body.setVelocityY(-500);
      this.coinScore++;
      this.scoreText.setText('💎 ' + this.coinScore);
    } else {
      this.die();
    }
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.player.body.setVelocity(0, -500);
    this.player.body.setEnable(false);
    this.tweens.add({
      targets: this.player,
      angle: 360,
      alpha: 0,
      y: this.player.y + 200,
      duration: 1000,
      onComplete: () => this.scene.restart()
    });
  }

  win(player, zone) {
    if (this.won) return;
    this.won = true;
    const elapsed = ((this.time.now - this.startTime) / 1000).toFixed(1);
    this.player.body.setEnable(false);
    this.tweens.add({
      targets: this.player,
      x: LEVEL.castle.x,
      y: LEVEL.castle.y + 30,
      alpha: 0.3,
      duration: 900,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.scene.start('Win', { coins: this.coinScore, time: elapsed });
      }
    });
  }

  update(time) {
    if (this.dead || this.won) {
      return;
    }

    const elapsed = (time - this.startTime) / 1000;
    const min = Math.floor(elapsed / 60);
    const sec = Math.floor(elapsed % 60);
    this.timeText.setText(`${min}:${sec.toString().padStart(2, '0')}`);

    let dir = 0;
    if (this.controls.left || this.cursors.left.isDown || this.keys.A.isDown) dir = -1;
    if (this.controls.right || this.cursors.right.isDown || this.keys.D.isDown) dir = 1;
    this.player.body.setVelocityX(dir * 220);

    if (dir < 0) this.player.setScale(-1, 1);
    else if (dir > 0) this.player.setScale(1, 1);

    const wantJump = this.controls.jump
      || this.cursors.up.isDown
      || this.cursors.space.isDown
      || this.keys.W.isDown
      || this.keys.SPACE.isDown;
    if (wantJump && this.player.body.blocked.down) {
      this.player.body.setVelocityY(-680);
    }

    this.enemies.children.iterate(enemy => {
      if (!enemy || !enemy.active) return;

      const dx = this.player.x - enemy.x;
      const dist = Math.abs(dx);
      const chasing = dist < 520;

      let d;
      if (chasing) {
        d = dx > 0 ? 1 : -1;
      } else {
        d = enemy.getData('dir');
      }

      const aheadX = enemy.x + d * 22;
      const belowY = enemy.y + 22;
      const hasGround = LEVEL.platforms.some(p =>
        aheadX >= p.x && aheadX <= p.x + p.w &&
        belowY >= p.y && belowY <= p.y + p.h
      );
      const blockedAhead = (d > 0 && enemy.body.blocked.right) || (d < 0 && enemy.body.blocked.left);

      if (!hasGround || blockedAhead) {
        if (chasing) {
          enemy.body.setVelocityX(0);
          enemy.setData('dir', d);
          return;
        } else {
          d = -d;
        }
      }

      const speed = chasing ? 110 : 80;
      enemy.body.setVelocityX(d * speed);
      enemy.setData('dir', d);
      enemy.setScale(d > 0 ? -1 : 1, 1);
    });

    if (this.player.y > LEVEL.height + 100) {
      this.die();
    }
  }
}
