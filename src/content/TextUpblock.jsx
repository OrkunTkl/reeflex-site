import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useTranslation } from 'react-i18next'
import FadingHtml from './props/FadingHtml.jsx'
import PointInteret from './PointInteret.jsx'
import { fishIcon, flaskIcon, waveIcon } from './props/icons.js'

// Ported from the real site's TextUpblock.jsx: real positions/rotations,
// title + subtitle as 3D text, the two longer paragraphs as HTML overlays
// (readable at any distance — CSS text, not a 3D mesh fighting fontSize),
// plus the same 3 POI hotspots real UpBlock has.
export default function TextUpblock() {
    const { t } = useTranslation()
    const { viewport } = useThree()
    const isMobile = viewport.width < 6

    const positionSubTitle = isMobile ? [5, 1.15, -2.1] : [5, 1.3, -3.1]
    const positionTitle = isMobile ? [5, 1.0, -2.1] : [5, 1.0, -2.0]
    const positionScrollText = isMobile ? [5, 0.7, -2.1] : [5, 0.5, -2.1]
    const positionTextOne = isMobile ? [2.0, 1.3, 1.6] : [3.1, 1.35, 1.7]
    const positionTextTwo = isMobile ? [0.2, 1.2, 1.6] : [-0.3, 1.4, 2.4]

    return (
        <>
            <group>
                <Text fontSize={viewport.width * 0.06} position={positionTitle} rotation={[0, 1.9, 0]} anchorX="center" anchorY="middle">
                    UPBLOCK
                    <meshStandardMaterial transparent opacity={0.5} color="white" />
                </Text>
                <Text
                    fontSize={isMobile ? viewport.width * 0.015 : viewport.width * 0.005}
                    position={positionSubTitle}
                    rotation={[0, 1.9, 0]}
                    anchorX="center"
                    anchorY="middle"
                >
                    {t('upBlockSubtitle')}
                    <meshStandardMaterial color="white" />
                </Text>
                <Text
                    fontSize={isMobile ? viewport.width * 0.015 : viewport.width * 0.005}
                    position={positionScrollText}
                    rotation={[0, 1.9, 0]}
                    anchorX="center"
                    anchorY="middle"
                >
                    Scroll
                    <meshStandardMaterial color={isMobile ? 'white' : '#003052'} />
                </Text>
            </group>
            <group>
                <FadingHtml position={positionTextOne}>
                    <div className="upblock-html upBlock-first-section-container">
                        <p className="text-html">{t('upBlockFirstPara')}</p>
                    </div>
                </FadingHtml>
                <FadingHtml position={positionTextTwo}>
                    <div className="upblock-html upBlock-second-section-container">
                        <p className="text-html">{t('upBlockSecondPara')}</p>
                    </div>
                </FadingHtml>
            </group>

            <PointInteret position={[-8.0, 0.3, -6]} label={waveIcon} enterScrollOffset={0.14} outScrollOffset={0.22}>
                <div className="popup-container-text">
                    <h3>{t('interestPointOneTitle')}</h3>
                    <p>{t('interestPointOne')}</p>
                </div>
            </PointInteret>
            <PointInteret position={[-9.8, 0.6, -6]} label={flaskIcon} enterScrollOffset={0.15} outScrollOffset={0.23}>
                <div className="popup-container-text">
                    <h3>{t('interestPointTwoTitle')}</h3>
                    <p>{t('interestPointTwo')}</p>
                </div>
            </PointInteret>
            <PointInteret position={[-11.8, 0, -6]} label={fishIcon} enterScrollOffset={0.16} outScrollOffset={0.245}>
                <div className="popup-container-text">
                    <h3>{t('interestPointThreeTitle')}</h3>
                    <p>{t('interestPointThree')}</p>
                </div>
            </PointInteret>
        </>
    )
}
