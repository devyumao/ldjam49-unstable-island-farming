export type SoundEffectName = 'jump';

export class SoundEffects {

    static names: SoundEffectName[] = [];

    protected _sounds: Object;

    constructor(protected sound: Phaser.Sound.NoAudioSoundManager
        | Phaser.Sound.HTML5AudioSoundManager
        | Phaser.Sound.WebAudioSoundManager
    ) {
        this._sounds = {};
        SoundEffects.names.forEach(name => {
            this._sounds[name] = sound.add(name, {
                volume: 0.5
            });
        });
    }

    play(name: SoundEffectName) {
        if (this._sounds[name]) {
            (this._sounds[name] as Phaser.Sound.BaseSound).play();
        }
    }

}
