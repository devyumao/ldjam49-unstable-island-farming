export default class ActionBadge extends Phaser.GameObjects.Image {
    static MAX_HIT_DISTANCE = 50;

    update(time, delta) {
        this.x -= delta * 0.12;

        if (this.x < 0) {
            this.setActive(false);
        }
    }
}
