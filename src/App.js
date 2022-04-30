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
            color="instagram"
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
        <div className="display-flex">
          <img src={imageData} alt="" srcSet="" />
          <br />
          {imageData ? (
            <Button
              icon
              color="instagram"
              labelPosition="right"
              onClick={convertImageToText}
            >
              Read Text
              <Icon name="right arrow" />
            </Button>
          ) : null}
          {progress ? (
            <>
              <p style={{ textAlign: "left", margin: "20px 0 0 0" }}>
                {progress.status[0].toUpperCase() + progress.status.slice(1)}
              </p>
              <Progress percent={progress.progress * 100} indicating />
            </>
          ) : null}
          {ocr ? (
            <>
              <h2>Output</h2>
              <p>{ocr}</p>
            </>
          ) : null}
        </div>
      </Container>
    </div>
  )
}
export default App
