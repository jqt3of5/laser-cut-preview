using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Core.Data;
using Newtonsoft.Json;
using NUnit.Framework;
using Svg;

namespace LaserPreviewTests
{
    [TestFixture]
    public class SvgProcessor_Tests
    {
        IEnumerable<SvgElement> ChildElements(SvgElement element)
        {
            if (element.Children.Any())
            {
                foreach (var child in element.Children)
                {
                    foreach (var childElement in ChildElements(child))
                    {
                        if (childElement is SvgPath || childElement is SvgCircle || childElement is SvgRectangle || childElement is SvgPolygon)
                        {
                            yield return childElement;
                        }
                    }
                }
            }
            else
            {
                yield return element;
            }
        }

        class PrintableSvgElement 
        {
            public readonly SvgElement _element;
            public PrintableSvgElement(SvgElement element)
            {
                _element = element;
            }

            public override string ToString()
            {
                string fill = string.Empty;
                if (_element.Fill == SvgPaintServer.None || _element.Fill == null)
                {
                    fill = "None";
                }
                if (_element.Fill is SvgColourServer fillServer)
                {
                    fill = $"{fillServer.Colour}";
                }
                
                string stroke = string.Empty;
                if (_element.Stroke == SvgPaintServer.None || _element.Stroke == null)
                {
                    stroke = "None";
                }
                if (_element.Stroke is SvgColourServer strokeServer)
                {
                    stroke = $"{strokeServer.Colour}";
                }

                return $"{_element.GetType().Name} - Fill: {fill} Stroke: {stroke} lineWidth: {_element.StrokeWidth}";
            }
        }
        
        [TestCase("EmptySvg.svg")]
        public void TestSubgraphicsWithEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subGraphics = processor.ExtractSubGraphicsFromSVG();
            
            Assert.That(subGraphics, Is.Empty);
            Assert.That(subGraphics, Is.Not.Null);
        } 
        
        [TestCase("EmptySvg.svg")]
        public void TestGraphicWithEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var graphic = processor.CreateGraphicGroupFromSubGraphics();
            
            Assert.That(graphic, Is.Not.Null);
            Assert.That(graphic.ViewBox.MinX, Is.Zero);
            Assert.That(graphic.ViewBox.MinY, Is.Zero);
            Assert.That(graphic.Height, Is.Zero);
            Assert.That(graphic.Width, Is.Zero);
        } 
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        public void TestSubGraphicsOnNonEmptySvg(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphicsFromSVG();
           
            Assert.That(subgraphics, Is.Not.Null.And.Not.Empty);
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        public void TestExtractColorPairsNotEmpty(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var colors = processor.ExtractColorPairs(originalSvg);
           
            Assert.That(colors, Is.Not.Null.And.Not.Empty);
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        public void TestExtractColorPairs(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var colors = processor.ExtractColorPairs(originalSvg);

            foreach (var color in colors)
            {
                var elements = processor.ExtractDrawableElementsWithColorPair(color, originalSvg);
                Assert.That(elements, Is.Not.Null.And.Not.Empty);
            }
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestSubGraphicsColor(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);
        
            var subDocs = processor.ExtractSubGraphicsFromSVG();
        
            Assume.That(subDocs, Is.Not.Null.And.Not.Empty);
            foreach (var subDoc in subDocs)
            {
                var elements = ChildElements(subDoc);
                Assert.That(elements, Is.Not.Empty);
                
                var first = elements.First();
                Assert.That(ChildElements(subDoc).Select(e => new PrintableSvgElement(e)), Is.All.Matches<PrintableSvgElement>(e =>
                {
                    var equals = new SvgProcessor.PaintServerPairEquality();

                    return equals.Equals((first.Fill, first.Stroke), (e._element.Fill, e._element.Stroke)) && first.StrokeWidth == e._element.StrokeWidth;
                }));
                
            } 
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestSubGraphicColorsIsDefaultBlue(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);
        
            var subDocs = processor.ExtractSubGraphicsFromSVG();
        
            Assume.That(subDocs, Is.Not.Null.And.Not.Empty);
            foreach (var subDoc in subDocs)
            {
                var elements = ChildElements(subDoc);
                Assert.That(elements, Is.Not.Empty);
                
                Assert.That(ChildElements(subDoc).Select(e => e.Fill), Is.All.EqualTo(SvgPaintServer.None));
                Assert.That(ChildElements(subDoc).Select(e => e.StrokeWidth.Value), Is.All.EqualTo(1f));
                Assert.That(ChildElements(subDoc).Select(e => e.Stroke), Is.All.TypeOf<SvgColourServer>());
                Assert.That(ChildElements(subDoc).Select(e => (e.Stroke as SvgColourServer).Colour), Is.All.EqualTo(Color.Blue));
            } 
        } 
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void SubgraphicsShouldHaveSameCount(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);
        
            var subDocs = processor.ExtractSubGraphicsFromSVG();

           Assert.That(ChildElements(originalSvg).ToList(),Has.Count.EqualTo(subDocs.Sum(sub => ChildElements(sub).Count())));

        } 
       
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestAllSubGraphicsHaveSameUnits(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subDocs = processor.ExtractSubGraphicsFromSVG();
           
            Assume.That(subDocs, Is.Not.Null.And.Not.Empty);
            
            Assert.Multiple(() =>
            {
                foreach (var subDoc in subDocs)
                {
                    Assert.That(subDoc.Width.Type, Is.EqualTo(originalSvg.Width.Type));
                    Assert.That(subDoc.Height.Type, Is.EqualTo(originalSvg.Height.Type));
                } 
            });
        }
        
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestDocumentBoundsAreSameAsSubGraphic(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subDocs = processor.ExtractSubGraphicsFromSVG();

            Assume.That(subDocs, Is.Not.Null.And.Not.Empty);
            
            var doc = processor.CreateGraphicGroupFromSubGraphics();

            var width = subDocs.Max(doc => doc.ViewBox.MinX + doc.ViewBox.Width) - subDocs.Min(tuple => doc.ViewBox.MinX);
            var height = subDocs.Max(doc => doc.ViewBox.MinY + doc.ViewBox.Height) - subDocs.Min(tuple => doc.ViewBox.MinY);

            Assert.That(width, Is.EqualTo(doc.ViewBox.Width));
            Assert.That(height, Is.EqualTo(doc.ViewBox.Height));
        }  
        // [TestCase("Group Test.svg")]
        // [TestCase("Overlapping test.svg")]
        // [TestCase("Test1.svg")]
        // [TestCase("Wood clock Gears.svg")]
        // [TestCase("minutesToHoursGears.svg")]
        // [TestCase("Phyrexian.svg")]
        // [TestCase("Test Fill and Stroke.svg")]
        // public void TestJsonSerializeDocuments(string filename)
        // {
        //     var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
        //     var processor = new SvgProcessor(originalSvg);
        //
        //     var subgraphics = processor.ExtractSubGraphicsFromSVG();
        //
        //     var (doc, graphic) = processor.CreateGraphicGroupFromSubGraphics("1234", "test");
        //
        //     var writer = new StringWriter();
        //     JsonSerializer.Create().Serialize(writer, graphic);
        //     Console.WriteLine(writer.ToString()); 
        //     Assert.That(writer.ToString(), Is.Not.Null.Or.Empty);
        // }  

    }
}