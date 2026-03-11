import os
import re

directories = ["d:/Fee-Insights/client/src/pages", "d:/Fee-Insights/client/src/components/views"]

for directory in directories:
    if not os.path.exists(directory): continue
    for filename in os.listdir(directory):
        if filename.endswith(".tsx"):
            filepath = os.path.join(directory, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # The regex matches something like:
            # <Badge variant="secondary" className="bg-red-100 text-red-700">Insight 10</Badge>
            # <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">Insight #12</Badge>
            # Note: We want to match <Badge... Insight ... </Badge> completely, possibly with newlines?
            # It's usually one line:
            # <Badge variant="secondary" className="...">Insight 3</Badge>
            
            # Use re.sub
            pattern = r'<Badge[^>]*>Insight\s*#?\d+.*?<\/Badge>\s*'
            new_content = re.sub(pattern, '', content)
            
            if content != new_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filename}")
