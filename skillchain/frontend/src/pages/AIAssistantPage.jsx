import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSend, FiCpu, FiTrash2, FiRefreshCw,
  FiUser, FiZap, FiMessageSquare
} from 'react-icons/fi'
import ReactMarkdown from 'react-markdown'
import {
  sendMessage, addUserMessage, fetchChatHistory, clearChatHistory
} from '../store/slices/chatSlice'
import { timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

const SUGGESTED_PROMPTS = [
  'What is a blockchain credential?',
  'How do I verify a skill on Polygon?',
  'Explain smart contract basics',
  'How to issue a credential on SkillChain?',
  'What is MetaMask and how to use it?',
  'Explain Polygon vs Ethereum differences',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0">
        <FiCpu size={13} className="text-neon-cyan" />
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5
        ${isUser
          ? 'bg-gradient-to-br from-neon-cyan to-neon-purple'
          : 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30'
        }`}>
        {isUser
          ? <FiUser size={13} className="text-dark-900" />
          : <FiCpu size={13} className="text-neon-cyan" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-neon-cyan/15 to-neon-purple/10 border border-neon-cyan/20 text-white rounded-br-sm'
            : 'glass-card border border-white/5 text-gray-200 rounded-bl-sm'
          }`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none
              prose-p:text-gray-200 prose-p:my-1
              prose-code:text-neon-cyan prose-code:bg-dark-800 prose-code:px-1 prose-code:rounded prose-code:text-xs
              prose-pre:bg-dark-800 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
              prose-strong:text-neon-cyan prose-strong:font-semibold
              prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline
              prose-ul:my-1 prose-li:text-gray-300
              prose-h1:text-white prose-h2:text-white prose-h3:text-white
            ">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-700 font-mono px-1">
          {timeAgo(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

export default function AIAssistantPage() {
  const dispatch = useDispatch()
  const { messages, loading } = useSelector(s => s.chat)
  const { user } = useSelector(s => s.auth)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { dispatch(fetchChatHistory()) }, [dispatch])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    dispatch(addUserMessage(msg))
    const result = await dispatch(sendMessage(msg))
    if (sendMessage.rejected.match(result)) {
      toast.error(result.payload || 'AI response failed')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearHistory = async () => {
    await dispatch(clearChatHistory())
    toast.success('Chat history cleared')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
            <FiCpu size={18} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="font-display text-xl text-white">
              AI <span className="gradient-text">Assistant</span>
            </h1>
            <p className="text-gray-500 text-xs font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse inline-block" />
              SkillChain AI · Powered by OpenAI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 glass-card border border-white/10 rounded-xl text-gray-500 hover:text-neon-pink transition-colors"
              title="Clear history"
            >
              <FiTrash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto glass-card border border-white/5 rounded-2xl p-4 md:p-6 space-y-5 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center mb-6"
            >
              <FiCpu size={32} className="text-neon-cyan" />
            </motion.div>
            <h2 className="font-display text-xl text-white mb-2">SkillChain AI</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-8">
              Your Web3 & blockchain assistant. Ask anything about credentials, smart contracts, or the SkillChain protocol.
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="glass-card border border-white/5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all text-left flex items-center gap-2 group"
                >
                  <FiZap size={12} className="text-neon-cyan opacity-50 group-hover:opacity-100 flex-shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id || i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0">
        <div className="glass-card border border-neon-cyan/10 rounded-2xl p-3 flex items-end gap-3
          focus-within:border-neon-cyan/30 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about blockchain credentials, Web3, Solidity..."
            rows={1}
            style={{ resize: 'none', maxHeight: '120px' }}
            className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-600 font-body leading-relaxed"
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center
              text-neon-cyan hover:bg-neon-cyan/20 transition-colors flex-shrink-0
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading
              ? <FiRefreshCw size={15} className="animate-spin" />
              : <FiSend size={15} />
            }
          </button>
        </div>
        <p className="text-center text-gray-700 text-[10px] font-mono mt-2">
          Press Enter to send · Shift+Enter for new line · History saved automatically
        </p>
      </div>
    </motion.div>
  )
}
