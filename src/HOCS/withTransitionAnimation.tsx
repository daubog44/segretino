import { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const withTransitionAnimation = (Component: FC<any>) => (props: any) => {
  const location = useLocation();

  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransistionStage] = useState("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname)
      setTransistionStage("fadeOut");
  }, [location, displayLocation]);

  return (
    <div
      className={`${transitionStage} h-full`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransistionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
      <Component {...props} />
    </div>
  );
};

export default withTransitionAnimation;
