export class arania {
    constructor(scene) {
        this.myScene = scene;
        this.health=40;
    }

    preload() {
        this.myScene.load.spritesheet('spider', '../../images/enemigos/SpiderCone.png', { frameWidth: 128, frameHeight: 128 });
        this.myScene.load.spritesheet('explosion', '../../images/enemigos/explosion.png', { frameWidth: 112, frameHeight: 112 });
        this.myScene.load.tilemapTiledJSON('enemyJSON', '../../json/Level1.json'); 

    }

    create(pPlayer) {
        this.myScene.anims.create({
            key: 'arania-caminar',
            frames: this.myScene.anims.generateFrameNumbers('spider', { start: 10, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
        this.myScene.anims.create({
            key: 'arania-danio',
            frames: [{ key: 'spider', frame: 0 }],
            frameRate: 10,
            repeat: 0
        });
        this.myScene.anims.create({
            key: 'arania-descanso',
            frames: [
                { key: 'spider', frame: 1 },
                { key: 'spider', frame: 2 },
                { key: 'spider', frame: 3 },
                { key: 'spider', frame: 4 },
                { key: 'spider', frame: 4 },
                { key: 'spider', frame: 4 },
                { key: 'spider', frame: 3 },
                { key: 'spider', frame: 2 },
                { key: 'spider', frame: 1 },
            ],
            frameRate: 6,
            repeat: -1
        });

        this.myScene.anims.create({
            key: 'arania-ataque',
            frames: this.myScene.anims.generateFrameNumbers('spider', { start: 5, end: 9 }),
            frameRate: 15,
            repeat: -1
        });

        this.map = this.myScene.make.tilemap({ key: 'enemyJSON' });

        // Capa de enemigos
        this.enemiesObj = this.map.getObjectLayer('Arania').objects;
        // Creamos grupo de enemigos
        this.enemies = this.myScene.physics.add.group();

        // Agregamos enemigos al grupo
        this.enemiesObj.forEach(element => {
            this.enemy = this.enemies.create(element.x, element.y - element.height, 'spider').play('arania-caminar', true);
            this.enemy.setScale(0.3); // Reducción del tamaño del sprite al 50%
            this.enemy.body.setSize(45, 48.5); // Ajustar el tamaño del cuerpo físico (la hitbox)
            this.enemy.body.setOffset(44, 70); // Ajustar la posición del cuerpo físico dentro del sprite
            this.enemy.setCollideWorldBounds(true);
        });

        this.myScene.anims.create({
            key: 'explosion-muerte',
            frames: this.myScene.anims.generateFrameNumbers('explosion', { start: 0, end: 77 }),
            frameRate: 20,
            repeat: 0
        });

        this.myScene.physics.add.collider(pPlayer, this.enemies, this.hitEnemy, null, this);
    }

    update(pPlayer) {
        this.data(pPlayer, this.enemies);
    }
    data(player, enemies) {
        enemies.children.iterate(child => {
            let distance = player.x - child.x;


            if(Phaser.Math.Distance.BetweenPoints(player, child) < 180){
                if(distance>20){
                    child.setVelocityX(50)
                    child.flipX=true
                    if (child.anims.currentAnim.key !== 'arania-caminar') {
                        child.play('arania-caminar', true);
                    }
                }else if(distance<-20){
                    child.setVelocityX(-50)
                    child.flipX=false
                    if (child.anims.currentAnim.key !== 'arania-caminar') {
                        child.play('arania-caminar', true);
                    }
                }else{

                    if (child.anims.currentAnim.key !== 'arania-ataque') {
                        child.play('arania-ataque', true);
                    }
                }
            }
            else{
                child.setVelocityX(0)
                child.play('arania-descanso', true)
            }

        });
    } 
    
    hitEnemy(player, enemy) {
        console.log(enemy.body);
        if(player.body.velocity.y > 0 && enemy.body.touching.up) {
            enemy.play('explosion-muerte', true);
            enemy.setVelocityX(0)
            this.myScene.time.delayedCall(1, () => { // Ajustar el tiempo según la duración de la animación de muerte
                enemy.destroy(); // Hacer el sprite invisible
                
                // Crear la explosión con una escala relativa al tamaño del enemigo
                let explosionScale = Math.min(enemy.displayWidth / 112, enemy.displayHeight / 112);
                let explosion = this.myScene.add.sprite(enemy.x, enemy.y, 'explosion').setScale(explosionScale);

                explosion.play('explosion-muerte');
                explosion.on('animationcomplete', () => {
                    explosion.destroy();
                    return
                });
            });
            player.setVelocityY(-200); // Rebota el jugador hacia arriba
        } else {
            // Aquí puedes manejar lo que sucede si el enemigo golpea al jugador
            player.health -= 20;
        }
    }

    
}