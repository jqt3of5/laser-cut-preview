using System.Collections.Generic;
using System.IO;
using System.Linq;
using Core.Data;
using NUnit.Framework;
using Svg;

namespace LaserPreviewTests
{
    [TestFixture]
    public class SvgProcessor_Tests
    {
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

            var (doc, graphic) = processor.CreateGraphicGroupFromSubGraphics("12345", filename);
            
            Assert.That(graphic, Is.Not.Null);
            Assert.That(graphic.name, Is.EqualTo(filename));
            Assert.That(graphic.guid, Is.EqualTo("12345"));
            Assert.That(graphic.subGraphics, Is.Not.Null.And.Empty);
            Assert.That(graphic.posX.value, Is.Zero);
            Assert.That(graphic.posY.value, Is.Zero);
            Assert.That(graphic.height.value, Is.Zero);
            Assert.That(graphic.width.value, Is.Zero);
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
                var elements = processor.ExtractDrawableElementsOfColors(color, originalSvg);
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
        
            var subgraphics = processor.ExtractSubGraphicsFromSVG();
        
            IEnumerable<SvgElement> ChildElements(SvgElement element)
            {
                if (element.Children.Any())
                {
                    foreach (var child in element.Children)
                    {
                        foreach (var childElement in ChildElements(child))
                        {
                            yield return childElement;
                        }
                    }
                }
                else
                {
                    yield return element;
                }
            }
            
                Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
                foreach (var subgraphic in subgraphics)
                {
                    var elements = ChildElements(subgraphic.document);
                    Assert.That(elements, Is.Not.Empty);
                    
                    var first = elements.First();
                    Assert.That(ChildElements(subgraphic.document), Is.All.Matches<SvgElement>(e =>
                    {
                        var equals = new SvgProcessor.PaintServerPairEquality();

                        return equals.Equals((first.Fill, first.Stroke), (e.Fill, e.Stroke));
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
        public void SubgraphicsShouldHaveSameCount(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);
        
            var subgraphics = processor.ExtractSubGraphicsFromSVG();
            
            IEnumerable<SvgElement> ChildElements(SvgElement element)
            {
                if (element.Children.Any())
                {
                    foreach (var child in element.Children)
                    {
                        foreach (var childElement in ChildElements(child))
                        {
                            yield return childElement;
                        }
                    }
                }
                else 
                {
                    yield return element;
                }
            }

           Assert.That(ChildElements(originalSvg).Count(), Is.EqualTo(subgraphics.Sum(sub => ChildElements(sub.document).Count())));

        } 
        [TestCase("Group Test.svg")]
        [TestCase("Overlapping test.svg")]
        [TestCase("Test1.svg")]
        [TestCase("Wood clock Gears.svg")]
        [TestCase("minutesToHoursGears.svg")]
        [TestCase("Phyrexian.svg")]
        [TestCase("Test Fill and Stroke.svg")]
        public void TestSubDocumentBoundsAreSameAsSubGraphic(string filename)
        {
            var originalSvg  = SvgDocument.Open(Path.Combine("TestAssets", filename));
            var processor = new SvgProcessor(originalSvg);

            var subgraphics = processor.ExtractSubGraphicsFromSVG();
           
            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            foreach (var subgraphic in subgraphics)
            {
                Assert.That(subgraphic.document.Height.Value, Is.EqualTo(subgraphic.subGraphic.height.value));
                Assert.That(subgraphic.document.Width.Value, Is.EqualTo(subgraphic.subGraphic.width.value));
            }
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

            var subgraphics = processor.ExtractSubGraphicsFromSVG();
           
            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            Assert.Multiple(() =>
            {
                foreach (var subgraphic in subgraphics)
                {
                    Assert.That(subgraphic.document.Width.Type, Is.EqualTo(originalSvg.Width.Type));
                    Assert.That(subgraphic.document.Height.Type, Is.EqualTo(originalSvg.Height.Type));
                    Assert.That(subgraphic.subGraphic.posX.unit, Is.EqualTo(originalSvg.Width.Type.ToUnits()));
                    Assert.That(subgraphic.subGraphic.width.unit, Is.EqualTo(originalSvg.Width.Type.ToUnits()));
                    Assert.That(subgraphic.subGraphic.height.unit, Is.EqualTo(originalSvg.Height.Type.ToUnits()));
                
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

            var subgraphics = processor.ExtractSubGraphicsFromSVG();

            Assume.That(subgraphics, Is.Not.Null.And.Not.Empty);
            
            var (doc, graphic) = processor.CreateGraphicGroupFromSubGraphics("1234", "test");

            var width = subgraphics.Max(tuple => tuple.subGraphic.posX.value + tuple.subGraphic.width.value) - subgraphics.Min(tuple => tuple.subGraphic.posX.value);
            var height = subgraphics.Max(tuple => tuple.subGraphic.posY.value + tuple.subGraphic.height.value) - subgraphics.Min(tuple => tuple.subGraphic.posY.value);

            Assert.That(width, Is.EqualTo(graphic.width.value));
            Assert.That(height, Is.EqualTo(graphic.height.value));
        }  
       
    }
}