import { createRef, useState } from "react"
import { Button, Container, Icon, Progress } from "semantic-ui-react"
import { createWorker } from "tesseract.js"
import "./App.css"

const App = () => {
  const [ocr, setOcr] = useState("")
  const [imageData, setImageData] = useState(null)
  const [imageName, setImageName] = useState("")
  const [progress, setProgress] = useState(null)

  const fileInputRef = createRef()

  const worker = createWorker({
    logger: (m) => setProgress(m),
    errorHandler: (e) => console.error(e)
  })

  const convertImageToText = async () => {
    setProgress(null)
    setOcr("")
    if (!imageData) return
    try {
      await worker.load()
      await worker.loadLanguage("eng")
      await worker.initialize("eng")
      const {
        data: { text }
      } = await worker.recognize(imageData)
      setOcr(text)
      setProgress((prev) => ({ ...prev, status: "done" }))
    } catch (err) {
      console.error(err)
    } finally {
      await worker.terminate()
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
          <div style={{ display: "flex" }}>
            <img src={imageData} alt="" srcSet="" />
            {ocr ? (
              <div style={{ width: "45%" }}>
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
