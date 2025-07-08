#!/usr/bin/env python3
"""
Repository Analysis Tool
Analyzes the SG-CRM-V1 codebase and generates insights
"""
import os
import json
from pathlib import Path
from typing import Dict, List, Any
import subprocess

class RepoAnalyzer:
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.analysis = {}
    
    def analyze_structure(self) -> Dict[str, Any]:
        """Analyze repository structure"""
        structure = {}
        
        for root, dirs, files in os.walk(self.repo_path):
            # Skip hidden directories and node_modules
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules' and d != '__pycache__']
            
            rel_path = os.path.relpath(root, self.repo_path)
            if rel_path == '.':
                rel_path = 'root'
            
            structure[rel_path] = {
                'directories': dirs,
                'files': files,
                'file_count': len(files),
                'python_files': [f for f in files if f.endswith('.py')],
                'js_files': [f for f in files if f.endswith(('.js', '.jsx'))],
                'config_files': [f for f in files if f in ['package.json', 'requirements.txt', '.env', 'Dockerfile']]
            }
        
        return structure
    
    def count_lines_of_code(self) -> Dict[str, int]:
        """Count lines of code by file type"""
        counts = {
            'python': 0,
            'javascript': 0,
            'html': 0,
            'css': 0,
            'json': 0,
            'markdown': 0,
            'total': 0
        }
        
        extensions = {
            '.py': 'python',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.md': 'markdown'
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
            
            for file in files:
                file_path = Path(root) / file
                ext = file_path.suffix.lower()
                
                if ext in extensions:
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = len(f.readlines())
                            counts[extensions[ext]] += lines
                            counts['total'] += lines
                    except:
                        pass
        
        return counts
    
    def analyze_dependencies(self) -> Dict[str, Any]:
        """Analyze project dependencies"""
        deps = {
            'python': [],
            'node': [],
            'docker': False
        }
        
        # Python dependencies
        req_file = self.repo_path / 'backend' / 'requirements.txt'
        if req_file.exists():
            with open(req_file, 'r') as f:
                deps['python'] = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        # Node dependencies
        package_file = self.repo_path / 'frontend' / 'package.json'
        if package_file.exists():
            with open(package_file, 'r') as f:
                package_data = json.load(f)
                deps['node'] = {
                    'dependencies': list(package_data.get('dependencies', {}).keys()),
                    'devDependencies': list(package_data.get('devDependencies', {}).keys())
                }
        
        # Docker
        dockerfile = self.repo_path / 'Dockerfile'
        deps['docker'] = dockerfile.exists()
        
        return deps
    
    def analyze_git_info(self) -> Dict[str, Any]:
        """Get Git repository information"""
        try:
            # Get current branch
            branch = subprocess.check_output(['git', 'branch', '--show-current'], 
                                           cwd=self.repo_path, text=True).strip()
            
            # Get commit count
            commit_count = subprocess.check_output(['git', 'rev-list', '--count', 'HEAD'], 
                                                 cwd=self.repo_path, text=True).strip()
            
            # Get last commit
            last_commit = subprocess.check_output(['git', 'log', '-1', '--format=%h %s %an %ad', '--date=short'], 
                                                cwd=self.repo_path, text=True).strip()
            
            return {
                'current_branch': branch,
                'total_commits': int(commit_count),
                'last_commit': last_commit,
                'is_git_repo': True
            }
        except:
            return {'is_git_repo': False}
    
    def find_key_files(self) -> List[str]:
        """Find important configuration and documentation files"""
        key_files = []
        important_files = [
            'README.md', 'package.json', 'requirements.txt', 'Dockerfile',
            'docker-compose.yml', '.env.example', 'setup.py', 'main.py',
            'App.jsx', 'index.js', 'app.py'
        ]
        
        for root, dirs, files in os.walk(self.repo_path):
            for file in files:
                if file in important_files:
                    rel_path = os.path.relpath(os.path.join(root, file), self.repo_path)
                    key_files.append(rel_path)
        
        return sorted(key_files)
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate comprehensive repository summary"""
        print("🔍 Analyzing repository structure...")
        structure = self.analyze_structure()
        
        print("📊 Counting lines of code...")
        loc = self.count_lines_of_code()
        
        print("📦 Analyzing dependencies...")
        deps = self.analyze_dependencies()
        
        print("📋 Finding key files...")
        key_files = self.find_key_files()
        
        print("🔧 Getting Git information...")
        git_info = self.analyze_git_info()
        
        summary = {
            'repository_info': {
                'path': str(self.repo_path.absolute()),
                'total_directories': len(structure),
                'key_files': key_files
            },
            'code_statistics': loc,
            'dependencies': deps,
            'git_info': git_info,
            'structure_overview': {
                'has_backend': any('backend' in path for path in structure.keys()),
                'has_frontend': any('frontend' in path for path in structure.keys()),
                'has_database': any('mongodb' in str(deps).lower() or 'database' in path for path in structure.keys()),
                'has_docker': deps['docker'],
                'tech_stack': self.detect_tech_stack(deps, structure)
            }
        }
        
        return summary
    
    def detect_tech_stack(self, deps: Dict, structure: Dict) -> List[str]:
        """Detect the technology stack"""
        stack = []
        
        # Backend technologies
        python_deps = deps.get('python', [])
        if any('fastapi' in dep.lower() for dep in python_deps):
            stack.append('FastAPI')
        if any('django' in dep.lower() for dep in python_deps):
            stack.append('Django')
        if any('flask' in dep.lower() for dep in python_deps):
            stack.append('Flask')
        if any('motor' in dep.lower() or 'pymongo' in dep.lower() for dep in python_deps):
            stack.append('MongoDB')
        
        # Frontend technologies
        node_deps = deps.get('node', {}).get('dependencies', [])
        if 'react' in node_deps:
            stack.append('React')
        if 'vue' in node_deps:
            stack.append('Vue.js')
        if 'angular' in node_deps:
            stack.append('Angular')
        if '@mui/material' in node_deps or '@material-ui/core' in node_deps:
            stack.append('Material-UI')
        
        # Other technologies
        if any('stripe' in dep.lower() for dep in python_deps):
            stack.append('Stripe')
        if deps.get('docker'):
            stack.append('Docker')
        
        return stack
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print formatted repository summary"""
        print("\n" + "="*60)
        print("📁 REPOSITORY ANALYSIS SUMMARY")
        print("="*60)
        
        # Repository Info
        repo_info = summary['repository_info']
        print(f"\n📍 Repository Path: {repo_info['path']}")
        print(f"📁 Total Directories: {repo_info['total_directories']}")
        
        # Git Info
        git_info = summary['git_info']
        if git_info['is_git_repo']:
            print(f"🌳 Current Branch: {git_info['current_branch']}")
            print(f"📊 Total Commits: {git_info['total_commits']}")
            print(f"💬 Last Commit: {git_info['last_commit']}")
        
        # Code Statistics
        loc = summary['code_statistics']
        print(f"\n📊 Code Statistics:")
        print(f"   Total Lines: {loc['total']:,}")
        print(f"   Python: {loc['python']:,}")
        print(f"   JavaScript: {loc['javascript']:,}")
        print(f"   HTML: {loc['html']:,}")
        print(f"   CSS: {loc['css']:,}")
        print(f"   Markdown: {loc['markdown']:,}")
        
        # Technology Stack
        tech_stack = summary['structure_overview']['tech_stack']
        print(f"\n🛠️  Technology Stack:")
        for tech in tech_stack:
            print(f"   • {tech}")
        
        # Project Structure
        structure = summary['structure_overview']
        print(f"\n🏗️  Project Structure:")
        print(f"   Backend: {'✅' if structure['has_backend'] else '❌'}")
        print(f"   Frontend: {'✅' if structure['has_frontend'] else '❌'}")
        print(f"   Database: {'✅' if structure['has_database'] else '❌'}")
        print(f"   Docker: {'✅' if structure['has_docker'] else '❌'}")
        
        # Key Files
        print(f"\n📋 Key Files Found:")
        for file in repo_info['key_files'][:10]:  # Show first 10
            print(f"   • {file}")
        if len(repo_info['key_files']) > 10:
            print(f"   ... and {len(repo_info['key_files']) - 10} more")
        
        # Dependencies Summary
        deps = summary['dependencies']
        print(f"\n📦 Dependencies:")
        print(f"   Python packages: {len(deps['python'])}")
        if deps['node']:
            node_deps = deps['node']
            print(f"   Node dependencies: {len(node_deps.get('dependencies', []))}")
            print(f"   Node dev dependencies: {len(node_deps.get('devDependencies', []))}")
        
        print("\n" + "="*60)
        print("✅ Analysis Complete!")
        print("="*60)

def main():
    """Main function to run repository analysis"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze repository structure and generate insights')
    parser.add_argument('--path', '-p', default='.', help='Path to repository (default: current directory)')
    parser.add_argument('--output', '-o', help='Output file for JSON results')
    parser.add_argument('--detailed', '-d', action='store_true', help='Show detailed analysis')
    
    args = parser.parse_args()
    
    analyzer = RepoAnalyzer(args.path)
    summary = analyzer.generate_summary()
    
    # Print summary
    analyzer.print_summary(summary)
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        print(f"\n💾 Detailed analysis saved to: {args.output}")
    
    # Show detailed analysis if requested
    if args.detailed:
        print(f"\n📋 Detailed Structure Analysis:")
        structure = analyzer.analyze_structure()
        for path, info in list(structure.items())[:10]:  # Show first 10 directories
            print(f"\n📁 {path}:")
            print(f"   Files: {info['file_count']}")
            if info['python_files']:
                print(f"   Python files: {', '.join(info['python_files'][:3])}")
            if info['js_files']:
                print(f"   JS files: {', '.join(info['js_files'][:3])}")

if __name__ == "__main__":
    main()
