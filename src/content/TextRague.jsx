import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useTranslation } from 'react-i18next'
import FadingHtml from './props/FadingHtml.jsx'

// Ported from the real site's TextRague.jsx: title/subtitle + two short
// sentences at their real positions, then the closing CTA as an HTML
// overlay (readable CSS text) right at the final camera position.
export default function TextRague() {
    const { viewport } = useThree()
    const isMobile = viewport.width < 6
    const positionTitle = isMobile ? [-45.8, -6.9, -7.2] : [-45.6, -6.9, -7.2]
    const positionSubTitle = isMobile ? [-45.8, -6.7, -7.2] : [-45.6, -6.5, -7.2]
    const positionFirstSentence = isMobile ? [-56.8, -7.5, -4.1] : [-56.8, -7.5, -4.1]
    const positionSecondSentence = isMobile ? [-62.8, -8.1, -4.9] : [-62.8, -8.1, -4.9]
    const positionEndLogo = isMobile ? [-73, -9.0, -5.4] : [-73, -9.0, -5.25]
    const { t } = useTranslation()

    return (
        <>
            <group>
                <Text fontSize={viewport.width * 0.06} position={positionTitle} rotation={[0, 2.1, 0]} anchorX="center" anchorY="middle">
                    SLABLINE
                    <meshStandardMaterial transparent opacity={0.5} color="white" />
                </Text>
                <Text
                    fontSize={isMobile ? viewport.width * 0.015 : viewport.width * 0.005}
                    position={positionSubTitle}
                    rotation={[0, 2.1, 0]}
                    anchorX="center"
                    anchorY="middle"
                >
                    {t('ragueSubtitle')}
                    <meshStandardMaterial color="white" />
                </Text>
                <Text fontSize={0.07} position={positionFirstSentence} rotation={[0, 1.7, 0]} anchorX="center" anchorY="middle" textAlign="center">
                    {t('ragueFirstSentence')}
                    <meshStandardMaterial color="white" />
                </Text>
                <Text fontSize={0.07} position={positionSecondSentence} rotation={[0, 1.5, 0]} anchorX="center" anchorY="middle" textAlign="center">
                    {t('ragueSecondSentence')}
                    <meshStandardMaterial color="white" />
                </Text>
            </group>
            <FadingHtml position={positionEndLogo}>
                <div className="upBlock-second-section-container end">
                    <div className="logo-end-mark">R≈</div>
                    <p className="end-sentence">{t('endSentence')}</p>
                    <a href="#dive-in">
                        <span className="btn-cta">{t('btnCta')}</span>
                    </a>
                </div>
            </FadingHtml>
        </>
    )
}
