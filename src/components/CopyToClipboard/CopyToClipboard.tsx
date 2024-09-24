import {useState} from 'react'
import {Check, Copy} from 'lucide-react'
import './CopyToClipboard.css'

interface CopyToClipboardProps {
    text: string
}

export default function Component({text}: CopyToClipboardProps) {
    const [isCopied, setIsCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <>
            <button
                className={"copy-button"}
                onClick={copyToClipboard}
                aria-label={isCopied ? "コピーしました" : "コピー"}
            >
                {isCopied ? (
                    <>
                        <Check className="copy-icon"/>
                    </>
                ) : (
                    <>
                        <Copy className="copy-icon"/>
                    </>
                )}
            </button>
        </>
    )
}
