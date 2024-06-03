declare module 'react-native-zoom-view' {
    import { Component } from 'react';
    import { ViewProps, ViewStyle, GestureResponderEvent } from 'react-native';

    interface ZoomableViewProps extends ViewProps {
        maxZoom?: number;
        minZoom?: number;
        zoomStep?: number;
        initialZoom?: number;
        bindToBorders?: boolean;
        style?: ViewStyle;
        onLongPress?: (event: GestureResponderEvent) => void;
    }

    export class ZoomableView extends Component<ZoomableViewProps> {}
}
