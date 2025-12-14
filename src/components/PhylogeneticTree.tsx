import { useEffect, useRef, useMemo } from 'react';
import { Species } from '@/types/taxonomy';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PhylogeneticTreeProps {
  species: Species[];
}

interface TreeNode {
  name: string;
  rank?: string;
  taxId?: string;
  children?: TreeNode[];
  isSpecies?: boolean;
}

export const PhylogeneticTree = ({ species }: PhylogeneticTreeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Build a merged tree from all species lineages
  const treeData = useMemo(() => {
    const root: TreeNode = {
      name: 'Root',
      children: [],
    };

    species.forEach((sp) => {
      let currentNode = root;

      sp.lineage.forEach((rank, index) => {
        const existingChild = currentNode.children?.find(
          (child) => child.name === rank.name && child.rank === rank.rank
        );

        if (existingChild) {
          currentNode = existingChild;
        } else {
          const newNode: TreeNode = {
            name: rank.name,
            rank: rank.rank,
            taxId: rank.taxId,
            children: [],
            isSpecies: index === sp.lineage.length - 1,
          };
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(newNode);
          currentNode = newNode;
        }
      });
    });

    // Clean up empty children arrays
    const cleanTree = (node: TreeNode): TreeNode => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        node.children = node.children.map(cleanTree);
      }
      return node;
    };

    return cleanTree(root);
  }, [species]);

  useEffect(() => {
    if (!svgRef.current || species.length < 2) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Calculate dimensions based on tree depth and width
    const countLeaves = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
    };

    const getDepth = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    };

    const leaves = countLeaves(treeData);
    const depth = getDepth(treeData);

    const margin = { top: 30, right: 180, bottom: 30, left: 60 };
    const width = Math.max(600, depth * 150);
    const height = Math.max(400, leaves * 50);

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>().size([height, width]);

    const hierarchyRoot = d3.hierarchy(treeData);
    const treeNodes = treeLayout(hierarchyRoot);

    // Create curved links
    const linkGenerator = d3
      .linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
      .x((d) => d.y)
      .y((d) => d.x);

    // Draw links with gradient effect
    g.selectAll('.link')
      .data(treeNodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('d', linkGenerator as any);

    // Draw nodes
    const nodes = g
      .selectAll('.node')
      .data(treeNodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    // Node circles with different colors for species vs ancestors
    nodes
      .append('circle')
      .attr('r', (d) => (d.data.isSpecies ? 8 : 5))
      .attr('fill', (d) =>
        d.data.isSpecies ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
      )
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2);

    // Species names (bold for actual species)
    nodes
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => (d.children ? -12 : 12))
      .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .style('font-size', (d) => (d.data.isSpecies ? '13px' : '11px'))
      .style('font-weight', (d) => (d.data.isSpecies ? '600' : '400'))
      .style('font-style', (d) => (d.data.isSpecies ? 'italic' : 'normal'))
      .style('fill', 'hsl(var(--foreground))')
      .text((d) => (d.data.name === 'Root' ? '' : d.data.name));

    // Rank labels for intermediate nodes
    nodes
      .filter((d) => !d.data.isSpecies && d.data.rank && d.data.name !== 'Root')
      .append('text')
      .attr('dy', '1.8em')
      .attr('x', (d) => (d.children ? -12 : 12))
      .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .style('font-size', '9px')
      .style('fill', 'hsl(var(--muted-foreground))')
      .text((d) => `(${d.data.rank})`);

  }, [species, treeData]);

  if (species.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Phylogenetic Tree
          <span className="text-sm font-normal text-muted-foreground">
            Evolutionary relationships between {species.length} species
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="min-h-[400px]" />
        </div>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span>Species</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span>Shared Ancestor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
