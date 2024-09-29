export enum ItemSpriteBlock{
    NULL = 0,
    S2 = 1,
    S4 = 2,
    S8 = 3,
    S16 = 4,
    S32 = 5,
    S64 = 6,
    S128 = 7,
    S256 = 8,
    S512 = 9,
    S1024 = 10,
    S2048 = 11,
    S4096 = 12,
    S8192 = 13,
    S16384 = 14,
    S32768 = 15,
    S65536 = 16
}

export enum MusicEvent {
    BGM = 'bgm',
    ACTION = 'action',
    GAME_OVER = 'over',
    /** 方块消除 */
    ELIMINATE = 'eliminate'
}

export enum NodeUrl {
    Canvas = 'Canvas',
    Music = 'Music'
}