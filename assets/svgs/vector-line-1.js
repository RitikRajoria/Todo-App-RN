import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <Path
      stroke="#000"
      strokeWidth={2}
      d="M-27 92C33.53 76.466 66.77 41.618 49.406-18"
    />
  </Svg>
);
export { SvgComponent as VectorLine1 };
