export type SoundEffectName = 'ahhh' | 'applause' | 'error' | 'jump' | 'plow'
    | 'sow' | 'water' | 'wow' | 'yeah';

export class SoundEffects {

    static names: SoundEffectName[] = [
        'ahhh', 'applause', 'error', 'jump', 'plow',
        'sow', 'water', 'wow', 'yeah'
    ];

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
