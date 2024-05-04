import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    height={props.height}
    width={props.width}
    viewBox="0 0 35 40"
    {...props}
  >
    <Path
      fill={props.color}
      d="M16 .5c8.837 0 16 7.163 16 16H16V.5ZM32 32.5c-8.837 0-16-7.163-16-16h16v16ZM0 32.5c8.837 0 16-7.163 16-16H0v16ZM0 16.5c8.837 0 16-7.163 16-16H0v16Z"
    />
  </Svg>
);
export { SvgComponent as Logo };
