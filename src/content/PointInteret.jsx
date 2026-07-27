import { Html, useScroll } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'

export default function PointInteret({ position, label = "", children, enterScrollOffset, outScrollOffset }) {
  const { gl } = useThree()
  const scroll = useScroll()
  const [visible, setVisible] = useState(false)
  const [show, setShow] = useState(false)
  const showButtonRef = useRef(false)
  const [, forceRender] = useState(0)

  const handleToggle = () => {
    if (visible) {
      setShow(false)
      setTimeout(() => setVisible(false), 300)
    } else {
      setVisible(true)
      setTimeout(() => setShow(true), 10)
    }
  }

  useFrame(() => {
    const offset = scroll.offset
    const isVisible = offset >= enterScrollOffset && offset < outScrollOffset
    if (isVisible !== showButtonRef.current) {
      showButtonRef.current = isVisible
      forceRender((n) => n + 1)
    }
    // auto-close the popup if the user keeps scrolling past it
    if (visible && !isVisible) handleToggle()
  })

  return (
    <>
      <Html portal={{ current: gl.domElement.parentNode }} position={position} distanceFactor={4}>
        <div
          className={`point-interet ${showButtonRef.current ? 'visible' : 'hidden'}`}
          onClick={handleToggle}
        >
          <img src={label} alt="" />
        </div>
      </Html>
      {/* Rendered via drei's Html (NOT a raw ReactDOM.createPortal — that
          breaks inside the R3F tree because R3F's own reconciler still
          tries to resolve <h3>/<p>/<div> as THREE objects). Not nested in
          any positioned/rotated <group> this time either, since a
          transformed ancestor is what broke "position: fixed" before —
          fullscreen mode doesn't need a 3D anchor at all. */}
      {visible && (
        <Html fullscreen portal={{ current: gl.domElement.parentNode }}>
          <div className={`popup-container ${show ? 'visible' : 'hidden'}`}>
            <div className="popup-content-container">
              {children}
              <div className="btn-close" onClick={handleToggle}>
                <div className="cross-container">
                  <div className="trait" />
                  <div className="trait" />
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  )
}
