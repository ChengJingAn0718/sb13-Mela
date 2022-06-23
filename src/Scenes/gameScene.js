import React, { useEffect, useRef, useContext, useState } from 'react';
import "../stylesheets/styles.css";
import BaseImage from '../components/BaseImage';
import { UserContext } from '../components/BaseShot';
import { getAudioPath, setExtraVolume, setPrimaryAudio, setRepeatAudio, setRepeatType, startRepeatAudio, stopRepeatAudio } from "../components/CommonFunctions"
import { prePathUrl } from "../components/CommonFunctions";
import { OptionScene } from "./optionScene"
import { SIGNALLIST } from '../components/CommonVarariant';

let timerList = []
let stepCount = 0;

let totalStep = 0

const questionPartCount = 4
let isDisabled = false;

let isEven = true;
let cIndex = 0

const Scene = React.forwardRef(({ nextFunc, _baseGeo, _geo, loadFunc }, ref) => {

    const audioList = useContext(UserContext)

    const optionPartRef = useRef()
    const zoomQuestionPartRef = useRef();

    const blackWhiteObject = useRef();
    const baseColorImgRef = useRef();
    const buttonRefs = useRef()
    const starRefs = Array.from({ length: 4 }, ref => useRef())
    const optionRef = useRef()

    const aniImageLists = [
        Array.from({ length: 4 }, ref => useRef()),
        Array.from({ length: 4 }, ref => useRef())
    ]

    const isExistOptionPart = true;
    const [iszoomQuestionShow, setzoomQuestionShow] = useState(true)

    const [isSceneLoad, setSceneLoad] = useState(false)
    const [isLastLoaded, setLastLoaded] = useState(false)

    const parentRef = useRef()

    const bodyAudio1s = [audioList.bodyAudio1, audioList.bodyAudio3]
    const bodyAudio2s = [audioList.bodyAudio2, audioList.bodyAudio4]

    useEffect(() => {

        return () => {
            stepCount = 0;
            totalStep = 0
            stopRepeatAudio()
        }
    }, [])



    React.useImperativeHandle(ref, () => ({
        sceneLoad: () => {
            setSceneLoad(true)
        },
        sceneStart: () => {

            setExtraVolume(audioList.commonAudio2, 3)
            setExtraVolume(audioList.commonAudio1, 3)

            parentRef.current.className = 'aniObject'
            startZoomQuestionPart()
            loadFunc()
            setRepeatType(1)
        },
        sceneEnd: () => {
            setSceneLoad(false)
            stepCount = 0;
            totalStep = 0

            isEven = true;
            cIndex = 0
    

            stopRepeatAudio()
        }
    }))

    const playZoomAnimation = () => {
        let imageNum = 0;
        blackWhiteObject.current.className = 'hideMask'
        baseColorImgRef.current.setClass('hideObject')

        aniImageLists[cIndex][0].current.setClass('showObject')
        let imageShowInterval = setInterval(() => {
            aniImageLists[cIndex][imageNum].current.setClass('hideObject')
            imageNum++
            aniImageLists[cIndex][imageNum].current.setClass('showobject')
            if (imageNum == 3) {
                clearInterval(imageShowInterval)
                showControlFunc()
            }
        }, 150);
    }

    const showControlFunc = () => {

        blackWhiteObject.current.style.WebkitMaskImage = 'url("' + prePathUrl() + 'images/question/' + (stepCount + 2) + '/m.png")'

        if (stepCount < 1)
            aniImageLists[cIndex].map((image, index) => {
                if (index < 3)
                    image.current.setUrl('question/' + (stepCount + 3) + '/' + (index + 1) + '.png')
            })

        timerList[2] = setTimeout(() => {
            if (stepCount == 0)
                audioList.commonAudio2.play();

            setPrimaryAudio(bodyAudio1s[cIndex])
            startRepeatAudio()

        }, 500);

        buttonRefs.current.className = 'show'
    }

    const returnBackground = () => {
        baseColorImgRef.current.setClass('show')

        buttonRefs.current.className = 'hideObject'
        aniImageLists[cIndex][3].current.setClass('hideObject')
        blackWhiteObject.current.className = 'show halfOpacity'

        if (stepCount < 2)
            aniImageLists[cIndex][3].current.setUrl('question/' + (stepCount + 2) + '/4.png')

        isEven = !isEven

        timerList[3] = setTimeout(() => {
            cIndex = isEven ? 0 : 1

            if (!isDisabled) {
                bodyAudio1s[cIndex].play().catch(error => { });
                setTimeout(() => {
                    playZoomAnimation();
                }, bodyAudio1s[cIndex].duration * 1000 + 2000);
            }
        }, 3000);
    }



    const clickAnswer = () => {
        //play answer..
        clearTimeout(timerList[3])
        clearTimeout(timerList[2])

        stopRepeatAudio()

        audioList.commonAudio2.pause();

        stepCount++
        if (stepCount < 2)
            bodyAudio1s[cIndex].src = getAudioPath('question/' + (stepCount + 2) + "/1")  //question

        bodyAudio2s[cIndex].play().catch(error => { });
        buttonRefs.current.style.pointerEvents = 'none'

        setTimeout(() => {
            audioList.successAudio.play().catch(error => { })

            starRefs[totalStep].current.setClass('show')
            totalStep++

            if (stepCount < 2)
                bodyAudio2s[cIndex].src = getAudioPath('question/' + (stepCount + 2) + "/2") //answer

            setTimeout(() => {
                audioList.successAudio.pause();
                audioList.successAudio.currentTime = 0;

                if (totalStep == 1) {
                    isDisabled = true;
                    returnBackground();
                    continueOptionPart()
                }
                else if (totalStep < questionPartCount) {
                    isDisabled = false;
                    returnBackground();
                    buttonRefs.current.style.pointerEvents = ''
                }
                if (totalStep == questionPartCount) {
                    setTimeout(() => {
                        nextFunc()
                    }, 2000);
                }
            }, 4000);

        }, bodyAudio2s[cIndex].duration * 1000);
    }

    const transSignaler = (signal) => {
        switch (signal) {
            case SIGNALLIST.startZoomQuestionPart:

                stepCount++
                startZoomQuestionPart();
                break;

            case SIGNALLIST.loadzoomQuestionPart:
                setzoomQuestionShow(true);
                break;

            case SIGNALLIST.buzzSound:
                audioList.buzzAudio.play();
                break;

            case SIGNALLIST.increaseMark:
                starRefs[totalStep].current.setClass('show')
                totalStep++;
                break;

            default:
                break;
        }
    }

    const startZoomQuestionPart = () => {

        if (isExistOptionPart)
            optionPartRef.current.className = 'disapear'

        stepCount = 0

        setPrimaryAudio(bodyAudio1s[cIndex])
        setRepeatAudio(audioList.commonAudio2)

        zoomQuestionPartRef.current.className = 'aniObject'

        blackWhiteObject.current.className = 'hideObject'
        buttonRefs.current.className = 'hideObject'

        bodyAudio1s[0].src = getAudioPath('question/1/1')  //question
        bodyAudio2s[0].src = getAudioPath('question/1/2')  //answer

        setTimeout(() => {

            bodyAudio1s[cIndex].play().catch(error => { });

            // bodyAudio1s[1].src = getAudioPath('question/2/1')  //question
            // bodyAudio2s[1].src = getAudioPath('question/2/2')  //answer

            setTimeout(() => {


                setLastLoaded(true)
                playZoomAnimation();


            }, bodyAudio1s[cIndex].duration * 1000 + 2000);
        }, 3000);





    }

    const continueOptionPart = () => {
        stopRepeatAudio()

        zoomQuestionPartRef.current.className = 'disapear'
        optionPartRef.current.className = 'appear'

        optionRef.current.continueGame()
    }

    const continueZoomQuestionPart = () => {

        isEven = true;
        cIndex = 0

        optionPartRef.current.className = 'disapear'

        setPrimaryAudio(bodyAudio1s[cIndex])
        setRepeatAudio(audioList.commonAudio2)

        zoomQuestionPartRef.current.className = 'aniObject'

        blackWhiteObject.current.className = 'hideObject'
        buttonRefs.current.className = 'hideObject'

        bodyAudio1s[0].src = getAudioPath('question/2/1')  //question
        bodyAudio2s[0].src = getAudioPath('question/2/2')  //answer

        setTimeout(() => {

            bodyAudio1s[cIndex].play().catch(error => { });

            bodyAudio1s[1].src = getAudioPath('question/3/1')  //question
            bodyAudio2s[1].src = getAudioPath('question/3/2')  //answer

            setTimeout(() => {

                setLastLoaded(true)
                playZoomAnimation();
                buttonRefs.current.style.pointerEvents = ''

            }, bodyAudio1s[cIndex].duration * 1000 + 2000);
        }, 3000);

    }

    return (
        <div>
            {
                isSceneLoad &&
                <div
                    ref={parentRef}
                    className='hideObject'>
                    <div
                        style={{
                            position: "fixed", width: _baseGeo.width + "px"
                            , height: _baseGeo.height + "px",
                            left: _baseGeo.left + 'px',
                            top: _baseGeo.top + 'px',
                            pointerEvents: 'none'
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
                                src={prePathUrl() + "images/bg/green_bg.png"}
                            />
                        </div>

                        {
                            Array.from(Array(starRefs.length).keys()).map(value =>
                                <div
                                    style={{
                                        position: "fixed", width: _geo.width * 0.05 + "px",
                                        right: _geo.width * (value * 0.047 + 0.02) + 'px'
                                        , top: 0.02 * _geo.height + 'px'
                                        , cursor: "pointer",
                                    }}>
                                    <BaseImage
                                        url={'Icon/grey_progress.png'}
                                    />
                                    <BaseImage
                                        ref={starRefs[starRefs.length - 1 - value]}
                                        url={'Icon/progress.png'}
                                        className='hideObject'
                                    />
                                </div>)
                        }
                    </div>

                    {
                        iszoomQuestionShow
                        &&
                        <div
                            ref={zoomQuestionPartRef}
                            className='hideObject'
                            style={{
                                position: "fixed", width: _baseGeo.width + "px"
                                , height: _baseGeo.height + "px",
                                left: _baseGeo.left + 'px',
                                top: _baseGeo.top + 'px',
                            }}
                        >

                            <BaseImage
                                ref={baseColorImgRef}
                                url={"bg/base.png"}
                            />

                            <div
                                ref={blackWhiteObject}
                                className="hideObject"
                                style={{
                                    position: "absolute", width: '100%'
                                    , height: '100%',
                                    left: '0%',
                                    top: '0%',
                                    WebkitMaskImage: 'url(' + prePathUrl() + 'images/question/1/m.png)',
                                    WebkitMaskSize: '100% 100%',
                                    WebkitMaskRepeat: "no-repeat",
                                    background: 'black',

                                }} >

                            </div>

                            {
                                aniImageLists.map(
                                    (aniImageList, index) =>
                                        (index == 0 || index == 1 && isLastLoaded) &&
                                        [1, 2, 3].map(value =>
                                            <BaseImage
                                                className='hideObject'
                                                ref={aniImageList[value - 1]}
                                                scale={1}
                                                posInfo={{ l: 0, t: 0 }}
                                                url={"question/" + (index + 1) + "/" + value + ".png"}
                                            />
                                        )
                                )
                            }

                            {
                                aniImageLists.map((aniImageList, index) =>
                                    (index == 0 || index == 1 && isLastLoaded) &&
                                    <div
                                        style={{
                                            position: "fixed", width: _geo.width * 1.3 + "px",
                                            height: _geo.height + "px",
                                            left: _geo.left - _geo.width * 0.15 + 'px'
                                            , top: _geo.top - _geo.height * 0.19 + 'px'
                                        }}>
                                        <BaseImage
                                            ref={aniImageList[3]}
                                            className='hideObject'
                                            url={"question/" + (index + 1) + "/4.png"}
                                        />
                                    </div>
                                )
                            }


                            <div ref={buttonRefs} className='hideObject'>
                                <div
                                    className='commonButton'
                                    onClick={clickAnswer}
                                    style={{
                                        position: "fixed", width: _geo.width * 0.1 + "px",
                                        height: _geo.width * 0.1 + "px",
                                        left: _geo.left + _geo.width * 0.445
                                        , top: _geo.top + _geo.height * 0.72
                                        , cursor: "pointer",
                                        borderRadius: '50%',
                                        overflow: 'hidden',

                                    }}>
                                    <img

                                        width={"370%"}
                                        style={{
                                            position: 'absolute',
                                            left: '-230%',
                                            top: '-32%'
                                        }}
                                        draggable={false}
                                        src={prePathUrl() + 'images/buttons/answer_button.svg'}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {
                        isExistOptionPart &&
                        <div
                            ref={optionPartRef}
                        >
                            <OptionScene
                                ref={optionRef}
                                transSignaler={transSignaler}
                                nextFunc={continueZoomQuestionPart}
                                _baseGeo={_baseGeo}
                                _geo={_geo} />
                        </div>
                    }
                </div>
            }
        </div>
    );
});

export default Scene;
