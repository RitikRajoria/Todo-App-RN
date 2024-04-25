import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <Path
      stroke="#000"
      strokeWidth={2}
      d="M-.411 1c57.91 8.5 25.41 53-4.59 71.853"
    />
  </Svg>
);
export { SvgComponent as VectorLine2 };
