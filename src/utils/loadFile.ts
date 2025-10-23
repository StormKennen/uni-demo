
class LoadFile {
  public async loadScript(src: string, isCache = true) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.type = "text/javascript"
      if (isCache) {
        script.src = src
      } else {
        script.src = src+ "?t=" + new Date().getTime()
      }
      // @ts-ignore
      if (script.readyState) {  //IE
        // @ts-ignore
        script.onreadystatechange = function () {
          // @ts-ignore
          if (script.readyState == "loaded" || script.readyState == "complete") {
            // @ts-ignore
            script.onreadystatechange = null
            resolve()
          }
        };
      } else {  //Others
        script.onload = function () {
          resolve()
        }
        script.onerror = reject
        script.onabort = reject
      }
      document.head.appendChild(script)
    })
  }
  public async loadCss(url: string, isCache = false) {
    return new Promise<void>((resolve, reject) => {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = url;
      link.onload = () => {
        resolve()
      }
      link.onabort = reject
      link.onerror = reject
      document.head.appendChild(link);
    })
  }
}

const loadFile = new LoadFile()

export default loadFile
