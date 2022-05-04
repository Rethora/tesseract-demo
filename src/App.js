import { createRef, useEffect, useState } from "react"
import { Button, Container, Icon, Progress } from "semantic-ui-react"
import { createWorker } from "tesseract.js"
import "./App.css"

const App = () => {
  const [ocr, setOcr] = useState("")
  const [imageData, setImageData] = useState(null)
  const [imageName, setImageName] = useState("")
  const [progress, setProgress] = useState(null)
  const [worker, setWorker] = useState(null)
  const [isReading, setIsReading] = useState(false)

  const fileInputRef = createRef()

  useEffect(() => {
    createMyWorker().then((w) => setWorker(w))
  }, [])

  useEffect(() => {
    if (
      progress &&
      progress.status === "initialized api" &&
      progress.progress === 1
    ) {
      setProgress(null)
    }
  }, [progress])

  const createMyWorker = async () => {
    try {
      const myWorker = createWorker({
        logger: (m) => setProgress(m),
        errorHandler: (e) => console.error(e)
      })
      await myWorker.load()
      await myWorker.loadLanguage("eng")
      await myWorker.initialize("eng")
      return myWorker
    } catch (err) {
      console.error(err)
    }
  }

  const handleImageChange = (e) => {
    setProgress(null)
    setOcr("")
    const file = e.target.files[0]
    if (!file) return
    setImageName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUri = reader.result
      setImageData(imageDataUri)
    }
    reader.readAsDataURL(file)
  }

  const convertImageToText = async () => {
    setProgress(null)
    setOcr("")
    if (!imageData) return
    setIsReading(true)
    try {
      const {
        data: { text }
      } = await worker.recognize(imageData)
      setOcr(text)
      setProgress((prev) => ({ ...prev, status: "done" }))
    } catch (err) {
      console.error(err)
    } finally {
      setIsReading(false)
    }
  }

  return (
    <div className="App">
      <Container>
        <h1>Convert Image to Text</h1>
        <h2>Upload an Image</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            icon="file"
            color="linkedin"
            content="Choose File"
            labelPosition="right"
            onClick={() => fileInputRef.current.click()}
          />
          <input
            hidden
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <p style={{ margin: "auto 0" }}>{imageName}</p>
        </div>
        {imageData ? (
          <>
            <h2>Extract Text From Image</h2>
            <Button
              icon
              color="linkedin"
              labelPosition="right"
              disabled={isReading}
              onClick={convertImageToText}
            >
              Start
              <Icon name="right arrow" />
            </Button>
          </>
        ) : null}
        {progress ? (
          <>
            <p style={{ margin: "40px auto 0 auto" }}>
              {progress.status[0].toUpperCase() + progress.status.slice(1)}
            </p>
            <Progress percent={progress.progress * 100} indicating />
          </>
        ) : null}
        <div style={{ padding: "30px 0" }}>
          <div className="in-out-container">
            <img src={imageData} alt="" srcSet="" />
            {ocr ? (
              <div className="output-container">
                <h2>Output</h2>
                <p>{ocr}</p>
              </div>
            ) : null}
          </div>
          <br />
        </div>
        <a
          rel="noreferrer"
          target="_blank"
          href="https://github.com/Rethora/tesseract-demo"
        >
          Source Code
        </a>
      </Container>
    </div>
  )
}
export default App
