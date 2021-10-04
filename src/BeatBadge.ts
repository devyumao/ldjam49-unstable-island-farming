import { ACTION_ICON_FRAME } from './constant';
import { ActionType, BeatType, PlantType } from './type';

export default class BeatBadge extends Phaser.GameObjects.Image {
    static MAX_HIT_DISTANCE = 32;

    beatType = BeatType.Small;
    action?: ActionType;
    icon?: Phaser.GameObjects.Image;
    v: number = 0;
    available = false;
    hit = false;

    set({ beatType, action }: {
        beatType: BeatType,
        action?: ActionType
    }) {
        this.beatType = beatType;
        this.action = action;
        this.setScale(2);
        switch (beatType) {
            case BeatType.Big:
                this.setTexture('beat');
                if (!this.icon) {
                    this.initIcon(action);
                } else {
                    this.showIcon(action)
                }
                break;
            case BeatType.Small:
                this.setTexture('beatSmall', 12);
                this.icon && this.hideIcon();
                break;
        }
        return this;
    }

    setV(v: number) {
        this.v = v;
        return this;
    }

    setAvailable(available: boolean) {
        this.available = available;
        return this;
    }

    setHit(hit: boolean) {
        this.hit = hit;
        return this;
    }

    isBigType() {
        return this.beatType === BeatType.Big;
    }

    isSmallType() {
        return this.beatType === BeatType.Small;
    }

    isInRange() {
        return this.getDistance() <= BeatBadge.MAX_HIT_DISTANCE;
    }

    getDistance() {
        return Math.abs(this.x - this.scene.scale.width / 2);
    }

    private initIcon(action: ActionType) {
        this.icon = this.scene.add.image(this.x, this.y, 'actionIcon', this.getIconFrame(action))
            .setScale(2)
            .setMask(this.mask);
    }

    private showIcon(action: ActionType) {
        this.icon.setFrame(this.getIconFrame(action));
        this.icon.setVisible(true);
    }

    private getIconFrame(action: ActionType) {
        const key = action === ActionType.Sow
            ? `${action}-${PlantType.Carrot}`
            : action;
        return ACTION_ICON_FRAME[key];
    }

    private hideIcon() {
        this.icon.setVisible(false);
    }

    update(time, delta) {
        if (this.active) {
            this.x -= delta * this.v;
            if (this.icon) {
                this.icon.x = this.x;
            }
        }

        if (this.x < 0) {
            this.setActive(false);
        }

        switch (this.beatType) {
            case BeatType.Big:
                if (this.available) {
                    this.setAlpha(0.8);
                    this.icon?.setAlpha(1);
                } else {
                    this.setAlpha(0.4);
                    this.icon?.setAlpha(0.4);
                }
                break;
            case BeatType.Small:
                this.setAlpha(0.7);
                break;
        }
    }
}
