

import "../stylesheets/styles.css"
import BaseImage from "./BaseImage"
import React, { useRef } from 'react'

export const MaskComponent = React.forwardRef((prop, ref) => {
    const currentMaskRef = useRef()

    React.useImperativeHandle(ref, () => ({
        setClass: (prop) => {
            currentMaskRef.current.className = prop
        }
    }))

    return (
        <div
            ref={currentMaskRef}
            className='hideObject'
            style={{
                position: "absolute",
                width: '100%'
                , height: '100%',
                left: '0%',
                top: '0%',
                WebkitMaskImage: 'url("' +
                    prop.maskPath
                    + '")',
                WebkitMaskSize: '100% 100%',
                WebkitMaskRepeat: "no-repeat"
            }}
        >
            <BaseImage
                url={'bg/base.png'}
            />
        </div>
    )

})