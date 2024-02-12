import { Button } from "./button"

const DownloadJSONButton = ({
  jsonData,
  fileName,
  children,
  className,
  ...props
}: {
  jsonData: any
  fileName: string
  className: string
  children: React.ReactNode
  props?: any
}) => {
  const downloadJson = () => {
    const jsonBlob = new Blob([JSON.stringify(jsonData)], {
      type: "application/json",
    })
    const url = window.URL.createObjectURL(jsonBlob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={downloadJson} className={className} {...props}>
      {children}
    </Button>
  )
}

export default DownloadJSONButton
