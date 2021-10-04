import BeatBadge from './BeatBadge';
import { BEAT_BADGE_DEPTH, BEAT_BADGE_SPACING, HIT_POINTER_DEPTH } from './constant';
import { ActionType, IBeat } from './type';

export interface IRhythmBoardConfig {
    bps: number;
    sequence: IBeat[];
    delayBeats?: number;
}

export default class RhythmBoard {
    scene: Phaser.Scene;
    bps: number;
    sequence: IBeat[];
    sequenceIndex = 0;
    delayBeats: number = 8;
    background: Phaser.GameObjects.Rectangle;
    mask: Phaser.Display.Masks.GeometryMask;
    stave: Phaser.GameObjects.Image;
    beatBadgeGroup: Phaser.GameObjects.Group;
    hitPointer: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, { bps, sequence, delayBeats }: IRhythmBoardConfig) {
        this.scene = scene;
        this.bps = bps;
        this.sequence = sequence;
        if (delayBeats != null) {
            this.delayBeats = delayBeats;
        }
        this.initBackground();
        this.initMask();
        this.initStave();
        this.initBeatBadgeGroup();
        this.initHitPointer();

        this.play();
    }

    private initBackground() {
        this.background = this.scene.add.rectangle(
            this.scene.scale.width / 2, 680,
            800, 64,
            0xffffff, 0
        );
    }

    private initMask() {
        const { scene, background } = this;
        const shape = scene.make.graphics({});
        shape.fillStyle(0xffffff);
        shape.beginPath();
        shape.fillRect(
            scene.scale.width / 2 - background.width / 2,
            background.y - background.height / 2,
            background.width, background.height
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
            .setAlpha(0.7);
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
            .setDepth(HIT_POINTER_DEPTH);
    }

    play() {
        const unitTime = 6e4 / this.bps * 0.5;
        this.createBeat();
        this.scene.time.addEvent({
            delay: unitTime,
            callback: () => this.createBeat(),
            callbackScope: this,
            loop: true
        });
    }

    private createBeat() {
        const x = this.scene.scale.width * 0.5 + BEAT_BADGE_SPACING * this.delayBeats;
        const unitTime = 6e4 / this.bps * 0.5;
        const v = BEAT_BADGE_SPACING / unitTime;
        const beat = this.sequence[this.sequenceIndex++ % this.sequence.length];
        return this.beatBadgeGroup.get(x, this.background.y)
            ?.setActive(true)
            .setMask(this.mask)
            .set(beat)
            .setV(v)
            .setHit(false);   
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
}
