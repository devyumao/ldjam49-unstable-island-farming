import BeatBadge from './BeatBadge';
import { BEAT_BADGE_DEPTH, BEAT_BADGE_SPACING, HIT_POINTER_DEPTH } from './constant';
import { ActionType, IBeat } from './type';

export interface IRhythmBoardConfig {
    bps: number;
    sequence: IBeat[];
    delayBeats?: number;
    music: Phaser.Sound.BaseSound;
}

export default class RhythmBoard {
    scene: Phaser.Scene;
    bps: number;
    sequence: IBeat[];
    beatCount = 0;
    delayBeats = 8;
    music: Phaser.Sound.BaseSound;
    background: Phaser.GameObjects.Rectangle;
    mask: Phaser.Display.Masks.GeometryMask;
    stave: Phaser.GameObjects.Image;
    beatBadgeGroup: Phaser.GameObjects.Group;
    hitPointer: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, { bps, sequence, delayBeats, music }: IRhythmBoardConfig) {
        this.scene = scene;
        this.bps = bps;
        this.sequence = sequence;
        this.music = music;
        if (delayBeats != null) {
            this.delayBeats = delayBeats;
        }
    }

    start() {
        this.initBackground();
        this.initMask();
        this.initStave();
        this.initBeatBadgeGroup();
        this.initHitPointer();
        this.play();
    }

    stop() {
        if (!this.background) {
            // first call
            return;
        }
        this.music.stop();
        this.background.destroy();
        this.mask.destroy();
        this.stave.destroy();
        this.beatBadgeGroup.destroy();
        this.hitPointer.destroy();
    }

    private initBackground() {
        this.background = this.scene.add.rectangle(
            this.scene.scale.width / 2, 680,
            800, 64,
            0xffffff, 0
        )
            .setScrollFactor(0);
    }

    private initMask() {
        const { scene, background } = this;
        const shape = scene.make.graphics({}).setScrollFactor(0);
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRect(
            scene.scale.width / 2 - background.width / 2,
            background.y - 64,
            background.width, 128
        )
        this.mask = shape.createGeometryMask();
        background.setMask(this.mask);
    }

    private initStave() {
        this.stave = this.scene.add.image(
            this.background.x, this.background.y,
            'stave', 8
        )
            .setScale(100, 4)
            .setAlpha(0.7)
            .setScrollFactor(0);
    }

    private initBeatBadgeGroup() {
        this.beatBadgeGroup = this.scene.add.group({
            classType: BeatBadge,
            maxSize: 40,
            runChildUpdate: true
        })
            .setDepth(BEAT_BADGE_DEPTH);
    }

    private initHitPointer() {
        this.hitPointer = this.scene.add.image(
            this.background.x, this.background.y,
            'hitPointer', 56
        )
            .setScale(2)
            .setAlpha(0.7)
            .setDepth(HIT_POINTER_DEPTH)
            .setScrollFactor(0);
    }

    private play() {
        const unitTime = 6e4 / this.bps * 0.5;

        this.music.play();

        // HACK
        this.createBeat();

        this.scene.time.addEvent({
            delay: unitTime,
            callback: () => this.createBeat(),
            callbackScope: this,
            loop: true
        });
        this.scene.time.addEvent({
            startAt: 100,
            delay: unitTime * 4,
            callback: () => {
                this.animateBeats();
            },
            callbackScope: this,
            loop: true
        });
    }

    private createBeat() {
        const x = this.scene.scale.width * 0.5 + BEAT_BADGE_SPACING * this.delayBeats;
        const unitTime = 6e4 / this.bps * 0.5;
        const v = BEAT_BADGE_SPACING / unitTime;
        const beat = this.sequence[this.beatCount % this.sequence.length];
        const badge =  this.beatBadgeGroup.get(x, this.background.y)
            ?.setActive(true)
            .setMask(this.mask)
            .setScrollFactor(0)
            .set(beat)
            .setV(v)
            .setHit(false);
        this.beatCount++;
        return badge;
    }

    getHitableBeat() {
        return (this.beatBadgeGroup.children.getArray() as BeatBadge[])
            .filter(badge => (
                badge.available && !badge.hit && badge.isInRange()
            ))
            .reduce((prev, curr) => {
                if (!prev) {
                    return curr;
                }
                return (curr.getDistance() < prev.getDistance()) ? curr : prev;
            }, null);
    }

    updateBeatsAvailable(availableActions: ActionType[]) {
        this.beatBadgeGroup.children.each((badge: BeatBadge) => {
            if (badge.isBigType()) {
                const available = availableActions.includes(badge.action);
                badge.setAvailable(available);
            }
        });
    }

    private animateBeats() {
        this.beatBadgeGroup.children.each((badge: BeatBadge) => {
            this.scene.tweens.add({
                targets: badge,
                duration: 50,
                yoyo: true,
                props: {
                    scale: 2.7
                }
            });
        });
    }

    animateHitPoint() {
        this.scene.tweens.add({
            targets: this.hitPointer,
            duration: 100,
            yoyo: true,
            props: {
                scaleY: 1
            }
        });
    }
}
