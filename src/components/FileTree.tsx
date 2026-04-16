import { FileTreeNode } from '../types'
import FileTreeItem from './FileTreeItem'

interface FileTreeProps {
  nodes: FileTreeNode[]
}

export default function FileTree({ nodes }: FileTreeProps) {
  return (
    <div className="py-2" role="tree" aria-label="File tree">
      {nodes.map((node) => (
        <FileTreeItem 
          key={node.path} 
          node={node}
          depth={0}
        />
      ))}
    </div>
  )
}
