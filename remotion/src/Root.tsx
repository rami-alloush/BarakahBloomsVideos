import React from 'react';
import {Composition} from 'remotion';
import {Ikhlas, TOTAL} from './ikhlas/Ikhlas';
import {IkhlasVertical, TOTAL_V} from './ikhlas/IkhlasVertical';
import {IkhlasVerticalFr, TOTAL_V_FR} from './ikhlas/IkhlasVerticalFr';
import {IkhlasVerticalEs, TOTAL_V_ES} from './ikhlas/IkhlasVerticalEs';
import {NaasVertical, TOTAL_V_NAAS} from './naas/NaasVertical';
import {FalaqVertical, TOTAL_V_FALAQ} from './falaq/FalaqVertical';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ikhlas" component={Ikhlas} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="IkhlasVertical" component={IkhlasVertical} durationInFrames={TOTAL_V} fps={30} width={1080} height={1920} />
    <Composition id="IkhlasVerticalEs" component={IkhlasVerticalEs} durationInFrames={TOTAL_V_ES} fps={30} width={1080} height={1920} />
    <Composition id="IkhlasVerticalFr" component={IkhlasVerticalFr} durationInFrames={TOTAL_V_FR} fps={30} width={1080} height={1920} />
    <Composition id="NaasVertical" component={NaasVertical} durationInFrames={TOTAL_V_NAAS} fps={30} width={1080} height={1920} />
    <Composition id="FalaqVertical" component={FalaqVertical} durationInFrames={TOTAL_V_FALAQ} fps={30} width={1080} height={1920} />
  </>
);
