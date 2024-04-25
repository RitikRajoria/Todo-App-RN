import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <Path
      stroke="#000"
      strokeWidth={2}
      d="M1 175.588s36.709-49.471 71.5-55c34.274-5.447 51.659 41.588 84 29 46.583-18.131-35.436-92.744 0-128 27.663-27.522 98-19.5 98-19.5"
    />
  </Svg>
);
export { SvgComponent as VectorLine3 };
