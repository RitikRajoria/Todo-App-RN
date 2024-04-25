import * as React from "react";
import Svg, { G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <G fill="#fff" fillOpacity={0.24} filter="url(#a)">
      <Path d="M67.156 130.308c-35.614.737-65.084-27.537-65.821-63.151l64.486-1.335 1.335 64.486Z" />
      <Path d="M0 2.67c35.614-.737 65.084 27.537 65.821 63.151L1.335 67.157 0 2.67ZM128.972 0c-35.615.737-63.888 30.207-63.15 65.821l64.485-1.335L128.972 0Z" />
      <Path d="M130.307 64.486c-35.614.738-63.888 30.207-63.15 65.822l64.486-1.336-1.336-64.486Z" />
    </G>
    <Defs></Defs>
  </Svg>
);
export { SvgComponent as LogoBig };
