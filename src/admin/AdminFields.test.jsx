import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextAreaField } from './AdminFields.jsx'

describe('auto-resizing text boxes', () => {
  it('grows and shrinks with text, and measures again when the window resizes', () => {
    const props = { label: '文字格', path: 'text', onChange: () => {}, autoResize: true }
    const { rerender } = render(<TextAreaField {...props} value="短句" />)
    const textarea = screen.getByRole('textbox', { name: '文字格' })
    let contentHeight = 240
    Object.defineProperties(textarea, {
      scrollHeight: { get: () => contentHeight },
      offsetHeight: { get: () => 74 },
      clientHeight: { get: () => 72 },
    })

    rerender(<TextAreaField {...props} value={'长句\n'.repeat(8)} />)
    expect(textarea.style.height).toBe('242px')
    contentHeight = 72
    rerender(<TextAreaField {...props} value="短句" />)
    expect(textarea.style.height).toBe('74px')
    contentHeight = 140
    fireEvent(window, new Event('resize'))
    expect(textarea.style.height).toBe('142px')
  })
})
