import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useTranslation } from 'react-i18next'

// Ported from the real site's TextLineHouse.jsx: just a title/subtitle plus
// two short 3D sentences at their real positions — no extra callout (the
// real site doesn't have one here, and cramming one in was what caused the
// text to overlap and become unreadable).
export default function TextLineHouse() {
    const { t } = useTranslation()
    const { viewport } = useThree()
    const isMobile = viewport.width < 6
    const positionTitle = isMobile ? [-19.5, -1.21, -7.95] : [-19.5, -1.2, -7.9]
    const positionSubTitle = isMobile ? [-19.5, -1, -7.95] : [-19.5, -0.8, -7.9]
    const positionTextOne = isMobile ? [-27.9, -3.0, -10.6] : [-27.9, -3.2, -10.9]
    const positionTextTwo = isMobile ? [-33.5, -4.4, -10.5] : [-33.5, -4.4, -10.9]

    return (
        <>
            <group>
                <Text fontSize={viewport.width * 0.06} position={positionTitle} rotation={[0, 1.3, 0]} anchorX="center" anchorY="middle">
                    LINEHOUSE
                    <meshStandardMaterial transparent opacity={0.5} color="white" />
                </Text>
                <Text
                    fontSize={isMobile ? viewport.width * 0.015 : viewport.width * 0.005}
                    position={positionSubTitle}
                    rotation={[0, 1.3, 0]}
                    anchorX="center"
                    anchorY="middle"
                >
                    {t('lineHouseSubtitle')}
                    <meshStandardMaterial color="white" />
                </Text>
            </group>
            <group>
                <Text fontSize={0.07} position={positionTextOne} rotation={[0, 1.4, 0]} anchorX="center" anchorY="middle" textAlign="center">
                    {t('lineHouseFirstSentence')}
                    <meshStandardMaterial color="white" />
                </Text>
                <Text fontSize={0.07} position={positionTextTwo} rotation={[0, 1.65, 0]} anchorX="center" anchorY="middle" textAlign="center">
                    {t('lineHouseSecondSentence')}
                    <meshStandardMaterial color="white" />
                </Text>
            </group>
        </>
    )
}
