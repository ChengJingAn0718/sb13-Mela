import React, { useEffect, useRef, useContext, useState } from 'react';
import "../stylesheets/styles.css";
import BaseImage from '../components/BaseImage';
import { UserContext } from '../components/BaseShot';
import { getAudioPath, prePathUrl, setExtraVolume } from "../components/CommonFunctions";
import { MaskComponent } from "../components/CommonComponents"


const maskPathList = [
    ['sub'],
    ['sub'],

    ['8'],
    ['9'],
    ['10'],
    ['11'],
]


const maskTransformList = [
    { x: 0.2, y: 0.0, s: 1.4 },
    { x: 0.35, y: 0.2, s: 2.6 },
    { x: 0.5, y: -0.5, s: 2 },
    { x: -0.21, y: 0.3, s: 1.6 },
    { x: -0.25, y: 0.1, s: 2 },
    { x: 0.4, y: 0.4, s: 1.8 },
]


// plus values..
const marginPosList = [
    {},
    {},
    { s: 3, l: 0.7, t: -1 },
    { s: 1.5, l: -0.3, t: 0.2 },
    { s: 2, l: -0.2, t: 0.0 },
    { s: 2, l: 0.2, t: 0.2 }, //6
]

const audioPathList = [
    ['3'],
    ['4', '5'],
    ['6'],
    ['7'],
    ['8'],
    ['9'],
]

let currentMaskNum = 0;
let subMaskNum = 0;
let isEven = true;

const subMarkInfoList = [

    [
        { p: '1', t: 2000, i: 0 },
        { p: '2', t: 3500, i: 1 },
        { p: '12', t: 5000, i: 2 },
    ],
    [
        { p: '3', t: 1000, i: 3 },
        { p: '4', t: 7500, i: 4 },
        { p: '5', t: 8500, i: 5 },
        { p: '6', t: 9500, i: 6 },
        { p: '7', t: 11500, i: 7 },
    ],


]
const Scene = React.forwardRef(({ nextFunc, _baseGeo, loadFunc, bgLoaded }, ref) => {

    const audioList = useContext(UserContext)

    const baseObject = useRef();
    const blackWhiteObjects = [useRef(), useRef()];
    const currentImages = [useRef(), useRef()];

    const colorObject = useRef();
    const subMaskRefList = Array.from({ length: 8 }, ref => useRef())

    const bodyAudios = [
        audioList.bodyAudio1, audioList.bodyAudio4,
    ]

    const [isSubMaskLoaded, setSubMaskLoaded] = useState(1)
    const [isSceneLoad, setSceneLoad] = useState(false)


    React.useImperativeHandle(ref, () => ({
        sceneLoad: () => {
            setSceneLoad(true)
        },
        sceneStart: () => {

            loadFunc()

            baseObject.current.className = 'aniObject'

            audioList.bodyAudio1.src = getAudioPath('intro/3');
            audioList.bodyAudio4.src = getAudioPath('intro/4');

            audioList.bodyAudio3.src = getAudioPath('intro/5');
            audioList.bodyAudio2.src = getAudioPath('intro/2');

            blackWhiteObjects[0].current.style.WebkitMaskImage = 'url("' +
                returnImgPath(maskPathList[2][0], true) + '")'

            blackWhiteObjects[1].current.style.WebkitMaskImage = 'url("' +
                returnImgPath(maskPathList[3][0], true) + '")'


            setTimeout(() => {
                setSubMaskLoaded(2)
                setExtraVolume(audioList.bodyAudio2, 3)
            }, 2000);

            setTimeout(() => {
                audioList.bodyAudio2.play()
                setTimeout(() => {

                    setExtraVolume(audioList.bodyAudio1, 3)
                    setExtraVolume(audioList.bodyAudio4, 3)
                    setExtraVolume(audioList.bodyAudio3, 3)

                    showIndividualImage()

                }, audioList.bodyAudio2.duration * 1000 + 1000);
            }, 3000);
        },
        sceneEnd: () => {

            currentMaskNum = 0;
            subMaskNum = 0;

            isEven = true;

            setSceneLoad(false)
        }
    }))


    function returnImgPath(imgName, isAbs = false) {
        return isAbs ? (prePathUrl() + 'images/intro/' + imgName + '.png')
            : ('intro/' + imgName + '.png');
    }

    const durationList = [
        2, 1, 1, 1.4, 1.4, 1.4, 1, 1, 1, 1.4, 1.4, 1.4, 1
    ]
    function showIndividualImage() {
        let cIndex = isEven ? 0 : 1;

        let currentMaskName = maskPathList[currentMaskNum][0]

        baseObject.current.style.transition = durationList[currentMaskNum] + 's'
        baseObject.current.style.transform =
            'translate(' + maskTransformList[currentMaskNum].x * 100 + '%,'
            + maskTransformList[currentMaskNum].y * 100 + '%) ' +
            'scale(' + maskTransformList[currentMaskNum].s + ') '

        setTimeout(() => {
            let timeDuration = bodyAudios[cIndex].duration * 1000 + 500
            let isSubAudio = false

            if (audioPathList[currentMaskNum].length > 1) {
                timeDuration += (audioList.bodyAudio3.duration * 1000 - 1000)
                isSubAudio = true;
            }

            if (currentMaskName != 'sub') {
                blackWhiteObjects[cIndex].current.className = 'show'
                colorObject.current.className = 'hide'
            }

            else {
                subMarkInfoList[subMaskNum].map((info, index) => {
                    setTimeout(() => {
                        if (index == 0)
                            colorObject.current.className = 'hide'

                        if (index == 1 && subMaskNum == 1)
                            subMaskRefList[info.i - 1].current.setClass('hide')

                        subMaskRefList[info.i].current.setClass('appear')
                    }, info.t);
                })
            }

            if (maskPathList[currentMaskNum].length > 1) {
                maskPathList[currentMaskNum].map((value, index) => {
                    setTimeout(() => {
                        if (index > 0) {
                            blackWhiteObjects[cIndex].current.style.WebkitMaskImage = 'url("' +
                                returnImgPath(maskPathList[currentMaskNum][index], true) + '")'
                        }


                    }, (bodyAudios[cIndex].duration * 1000 + 1000) / maskPathList[currentMaskNum].length * index);
                }
                )
            }

            setTimeout(() => {

                if (marginPosList[currentMaskNum].s != null) {
                    currentImages[cIndex].current.style.transform =
                        "translate(" + _baseGeo.width * marginPosList[currentMaskNum].l / 100 + "px,"
                        + _baseGeo.height * marginPosList[currentMaskNum].t / 100 + "px)"
                        + "scale(" + (1 + marginPosList[currentMaskNum].s / 100) + ") "
                }

                setSubMaskLoaded(2) //second part

                bodyAudios[cIndex].play().catch(error => { });

                if (isSubAudio)
                    setTimeout(() => {

                        setTimeout(() => {
                            audioList.bodyAudio3.play();
                        }, 500);
                    }, bodyAudios[cIndex].duration * 1000 + 500);

                setTimeout(() => {
                    if (currentMaskNum < audioPathList.length - 2) {
                        bodyAudios[cIndex].src = getAudioPath('intro/' + audioPathList[currentMaskNum + 2][0]);
                    }

                    setTimeout(() => {
                        currentImages[cIndex].current.style.transform = "scale(1)"

                        setTimeout(() => {
                            colorObject.current.className = 'show'
                        }, 300);

                        setTimeout(() => {
                            if (currentMaskNum == maskPathList.length - 1) {
                                setTimeout(() => {
                                    baseObject.current.style.transition = '2s'

                                    baseObject.current.style.transform =
                                        'translate(' + '0%,0%)' +
                                        'scale(1)'

                                    setTimeout(() => {
                                        nextFunc()
                                    }, 5000);

                                }, 2000);
                            }
                            else {
                                if (currentMaskName == 'sub') {
                                    subMaskRefList.map(mask => {
                                        if (mask.current)
                                            mask.current.setClass('hide')
                                    })
                                    subMaskNum++
                                }
                                else {
                                    isEven = !isEven
                                    let subCount = 0
                                    for (let i = currentMaskNum + 1; i < maskPathList.length; i++) {

                                        if (maskPathList[i][0] != 'sub')
                                            subCount++

                                        if (subCount == 2) {
                                            blackWhiteObjects[cIndex].current.style.WebkitMaskImage = 'url("' +
                                                returnImgPath(maskPathList[i][0], true) + '")'
                                            break;
                                        }
                                    }

                                }

                                currentMaskNum++;

                                blackWhiteObjects[cIndex].current.className = 'hide'
                                
                                setTimeout(() => {
                                    showIndividualImage()
                                }, 2000);

                            }
                        }, 500);
                    }, 2000);
                }, timeDuration);
            }, 1000);

        }, durationList[currentMaskNum] * 1000);
    }

    return (
        <div>
            {
                isSceneLoad &&
                <div ref={baseObject}
                    className='hideObject'
                    style={{
                        position: "fixed", width: _baseGeo.width + "px"
                        , height: _baseGeo.height + "px",
                        left: _baseGeo.left + 'px',
                        top: _baseGeo.top + 'px',
                    }}
                >
                    <div
                        style={{
                            position: "absolute", width: '100%'
                            , height: '100%',
                            left: '0%',
                            top: '0%'
                        }} >
                        <img
                            width={'100%'}
                            style={{
                                position: 'absolute',
                                left: '0%',
                                top: '0%',

                            }}
                            src={returnImgPath('grey_bg', true)}
                        />
                    </div>

                    {
                        blackWhiteObjects.map((blackWhiteObject, index) =>
                            <div
                                ref={blackWhiteObject}
                                className='hideObject'
                                style={{
                                    position: "absolute", width: '100%'
                                    , height: '100%',
                                    left: '0%',
                                    top: '0%',
                                    transition: '0.5s',
                                    WebkitMaskImage: 'url("' +
                                        returnImgPath(maskPathList[2 + index][0], true)
                                        + '")',
                                    WebkitMaskSize: '100% 100%',
                                    WebkitMaskRepeat: "no-repeat"
                                }} >

                                <div
                                    ref={currentImages[index]}
                                    style={{
                                        position: 'absolute',
                                        left: '0%',
                                        top: '0%',
                                        width: '100%',
                                        height: '100%',
                                        transition: '0.5s',
                                    }}
                                >
                                    <BaseImage
                                        url={'bg/base.png'}
                                    />

                                </div>
                            </div>
                        )
                    }


                    {
                        subMarkInfoList.map((groupMask, groupIndex) =>
                            (groupIndex) < isSubMaskLoaded && groupMask.map((value, index) =>
                                <MaskComponent
                                    ref={subMaskRefList[groupIndex * 3 + index]}
                                    maskPath={returnImgPath(value.p, true)}
                                />

                            )
                        )
                    }
                    <div
                        ref={colorObject}
                        style={{
                            position: "absolute", width: '100%'
                            , height: '100%',
                            left: '0%',
                            top: '0%',
                        }} >
                        <BaseImage
                            onLoad={bgLoaded}
                            url={'bg/base.png'}
                        />
                    </div>
                </div>
            }
        </div>
    );
});

export default Scene;
