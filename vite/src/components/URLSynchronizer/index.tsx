import { navigatorPathAtom } from "@/atoms/navigator";
import { useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

const URLSynchronizer = () => {
  const params = useParams() as any;
  const [path, setPath] = useRecoilState(navigatorPathAtom);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    history.push({
      pathname: `${params.projectId}`,
      hash: path,
    });
  }, [path]);

  useEffect(() => {
    window.projectId = params.projectId;
    const urlPath = location.hash.replace("#", "");
    setPath(urlPath || "/");
  }, []);

  return null;
};

export default URLSynchronizer;
