import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MarkdownViewProps {
  content: string;
}

/**
 * Lightweight markdown renderer for AI-generated fortune analysis.
 * Handles: **bold**, ### headings, - bullets, 1. numbered lists, \n paragraphs.
 */
export function MarkdownView({ content }: MarkdownViewProps) {
  const blocks = parseBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'h3') {
          return (
            <Text key={i} style={styles.h3}>{block.text}</Text>
          );
        }
        if (block.type === 'bullet') {
          return (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>
                {renderInline(block.text)}
              </Text>
            </View>
          );
        }
        if (block.type === 'numbered') {
          return (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bullet}>{block.number}.</Text>
              <Text style={styles.listText}>
                {renderInline(block.text)}
              </Text>
            </View>
          );
        }
        // paragraph
        return (
          <Text key={i} style={styles.paragraph}>
            {renderInline(block.text)}
          </Text>
        );
      })}
    </View>
  );
}

type Block =
  | { type: 'h3'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; number: number; text: string }
  | { type: 'paragraph'; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let paraLines: string[] = [];

  const flushPara = () => {
    const text = paraLines.join('\n').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paraLines = [];
  };

  for (const line of lines) {
    // ### heading
    const h3m = line.match(/^###\s+(.+)/);
    if (h3m) {
      flushPara();
      blocks.push({ type: 'h3', text: h3m[1] });
      continue;
    }

    // ## heading → h3 style
    const h2m = line.match(/^##\s+(.+)/);
    if (h2m) {
      flushPara();
      blocks.push({ type: 'h3', text: h2m[1] });
      continue;
    }

    // # heading → h3 style
    const h1m = line.match(/^#\s+(.+)/);
    if (h1m) {
      flushPara();
      blocks.push({ type: 'h3', text: h1m[1] });
      continue;
    }

    // - bullet
    const bm = line.match(/^[-*]\s+(.+)/);
    if (bm) {
      flushPara();
      blocks.push({ type: 'bullet', text: bm[1] });
      continue;
    }

    // 1. 2. numbered
    const nm = line.match(/^(\d+)[.)]\s+(.+)/);
    if (nm) {
      flushPara();
      blocks.push({ type: 'numbered', number: parseInt(nm[1]), text: nm[2] });
      continue;
    }

    // Chinese numbered: 一、二、三、
    const cnm = line.match(/^([一二三四五六七八九十]+)、(.+)/);
    if (cnm) {
      flushPara();
      blocks.push({ type: 'h3', text: line.trim() });
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      flushPara();
      continue;
    }

    // Normal text
    paraLines.push(line);
  }
  flushPara();

  return blocks;
}

/** Render inline markdown: **bold** */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  h3: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 24,
  },
  paragraph: {
    color: '#ccccee',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 4,
  },
  bullet: {
    color: '#6C63FF',
    fontSize: 14,
    lineHeight: 24,
    width: 20,
    fontWeight: '600',
  },
  listText: {
    color: '#ccccee',
    fontSize: 14,
    lineHeight: 24,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: '#e8e8f0',
  },
});
