import React, { useState } from 'react';
import { Sparkles, Copy, Check, Palette, Lightbulb } from 'lucide-react';
import { useEvent } from '../../hooks/useEvent';
import { AiService } from '../../services/gemini/aiService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const AiConceptGenerator: React.FC = () => {
  const { event } = useEvent();
  const [themeKeyword, setThemeKeyword] = useState(event?.theme || 'Royal Rose Gold & Botanicals');
  const [loading, setLoading] = useState(false);
  const [concepts, setConcepts] = useState<any>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await AiService.generateConcepts({
        themeKeyword,
        category: event?.category || 'celebration',
      });
      setConcepts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-100 p-5 sm:p-6 shadow-subtle space-y-4">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-accent-50 text-accent-600 shrink-0">
            <Palette className="w-5 h-5 text-accent-500" />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-serif font-bold text-charcoal leading-snug">
              AI Aesthetic Concept &amp; Color Palette
            </h4>
            <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
              Generate complementary harmonies, stage designs, and styling guidelines
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 min-w-0">
            <Input
              placeholder="e.g. Minimalist Tuscan Sunset"
              value={themeKeyword}
              onChange={(e) => setThemeKeyword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            onClick={handleGenerate}
            loading={loading}
            icon={Sparkles}
            size="md"
            className="shrink-0"
          >
            Generate
          </Button>
        </form>
      </div>

      {concepts && (
        <div className="space-y-4 pt-4 border-t border-charcoal-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Curated Theme
            </span>
            <h3 className="text-lg font-serif font-bold text-charcoal mt-0.5">
              {concepts.themeTitle}
            </h3>
            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
              {concepts.description}
            </p>
          </div>

          {/* Color Palette Swatches */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Color Harmony Swatches (Click HEX to copy)
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {concepts.colorPalette?.map((color: any, i: number) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(color.hex)}
                  className="p-2.5 rounded-2xl bg-background-subtle border border-charcoal-100 cursor-pointer hover:shadow-subtle transition-all group"
                >
                  <div
                    className="w-full h-14 rounded-xl shadow-inner mb-2 border border-black/5"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex items-center justify-between text-xs gap-1">
                    <span className="font-semibold text-charcoal truncate min-w-0" title={color.name}>
                      {color.name}
                    </span>
                    <span className="text-[10px] font-mono text-charcoal-500 group-hover:text-primary flex items-center gap-0.5 shrink-0">
                      {copiedHex === color.hex ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      )}
                      {color.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decor & Attire Highlights */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-background-subtle/70 border border-charcoal-100">
              <h5 className="text-xs font-bold text-charcoal flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Decor &amp; Floral Ideas
              </h5>
              <ul className="space-y-1.5 text-xs text-charcoal-600 list-disc list-inside">
                {concepts.decorIdeas?.map((idea: string, i: number) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-background-subtle/70 border border-charcoal-100 space-y-2 text-xs">
              <div>
                <span className="font-bold text-charcoal block">Stage &amp; Lighting:</span>
                <span className="text-charcoal-600">{concepts.stageLightingConcept}</span>
              </div>
              <div>
                <span className="font-bold text-charcoal block">Guest Attire Guidance:</span>
                <span className="text-charcoal-600">{concepts.attireSuggestions}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

