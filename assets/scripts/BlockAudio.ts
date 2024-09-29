import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockAudio')
export class BlockAudio extends Component {

    @property(AudioClip)
    clips: AudioClip[] = [];

    @property(AudioSource)
    audioSource: AudioSource = null!;

    audioQueue(index: number){
        let clip: AudioClip = this.clips[index];

        this.audioSource.playOneShot(clip);
    }
}


